import { Hono } from "hono";
import OpenAI from "openai";

const app = new Hono<{ Bindings: Env }>();

// Detect language from IP
app.get("/api/detect-language", async (c) => {
  const cfData = c.req.raw.cf;
  
  if (cfData && typeof cfData === 'object' && 'country' in cfData) {
    const country = cfData.country as string;
    
    // Map country codes to language codes
    const countryToLanguage: Record<string, string> = {
      'BR': 'pt', // Brazil
      'PT': 'pt', // Portugal
      'US': 'en', // United States
      'GB': 'en', // United Kingdom
      'CA': 'en', // Canada
      'AU': 'en', // Australia
      'ES': 'es', // Spain
      'MX': 'es', // Mexico
      'AR': 'es', // Argentina
      'CO': 'es', // Colombia
      'FR': 'fr', // France
      'DE': 'de', // Germany
      'IT': 'it', // Italy
      'JP': 'ja', // Japan
      'CN': 'zh', // China
    };
    
    const language = countryToLanguage[country] || 'en';
    return c.json({ language, country });
  }
  
  // Default to English if unable to detect
  return c.json({ language: 'en', country: 'unknown' });
});

// Get all exercises with optional filters
app.get("/api/exercises", async (c) => {
  const muscleGroup = c.req.query("muscle_group");
  const difficulty = c.req.query("difficulty");
  
  let sql = "SELECT * FROM exercises WHERE 1=1";
  const params: string[] = [];
  
  if (muscleGroup) {
    sql += " AND muscle_group = ?";
    params.push(muscleGroup);
  }
  
  if (difficulty) {
    sql += " AND difficulty = ?";
    params.push(difficulty);
  }
  
  sql += " ORDER BY name ASC";
  
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(result.results);
});

// Get single exercise by ID
app.get("/api/exercises/:id", async (c) => {
  const id = c.req.param("id");
  
  const result = await c.env.DB.prepare(
    "SELECT * FROM exercises WHERE id = ?"
  ).bind(id).first();
  
  if (!result) {
    return c.json({ error: "Exercise not found" }, 404);
  }
  
  return c.json(result);
});

// Get unique muscle groups
app.get("/api/muscle-groups", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT DISTINCT muscle_group FROM exercises ORDER BY muscle_group ASC"
  ).all();
  
  return c.json(result.results.map((r: any) => r.muscle_group));
});

// Generate workout preview with AI
app.post("/api/workout-preview", async (c) => {
  const body = await c.req.json();
  const { workout_type, selected_sports, sport_days, allow_mixed_days, experience_level, primary_goal, training_days, injuries, equipment, time_per_session } = body;

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ 
      error: "API OpenAI não configurada. Configure a chave OPENAI_API_KEY."
    }, 503);
  }

  try {
    // Map user-friendly sport names to database sport_category values
    const sportMapping: Record<string, string> = {
      'Musculação': 'Musculação',
      'Calistenia': 'Calistenia',
      'Boxe': 'Artes Marciais - Lutas',
      'MMA': 'Artes Marciais - Lutas',
      'Muay Thai': 'Artes Marciais - Lutas',
      'Jiu-Jitsu': 'Artes Marciais - Grappling',
      'Futebol': 'Futebol',
      'Basquete': 'Basquete',
      'Vôlei': 'Vôlei',
      'Natação': 'Natação',
      'Corrida': 'Corrida',
      'Ciclismo': 'Ciclismo',
      'Tênis': 'Tênis',
      'Handebol': 'Handebol',
      'Yoga': 'Yoga'
    };

    // Get exercises from database
    let exercisesQuery = "SELECT * FROM exercises";
    const params: any[] = [];
    
    // Filter by selected sports (for both hybrid and traditional with specific sport)
    if (selected_sports && selected_sports.length > 0) {
      // Map selected sports to database categories
      const dbCategories = selected_sports.map((sport: string) => sportMapping[sport] || sport);
      // Remove duplicates (e.g., Boxe, MMA, Muay Thai all map to same category)
      const uniqueCategories = [...new Set(dbCategories)];
      
      const placeholders = uniqueCategories.map(() => '?').join(',');
      exercisesQuery += ` WHERE sport_category IN (${placeholders})`;
      params.push(...uniqueCategories);
    } else if (workout_type === 'traditional') {
      // Default to Musculação for traditional workouts if no sport specified
      exercisesQuery += ` WHERE sport_category = ?`;
      params.push('Musculação');
    }
    
    exercisesQuery += " ORDER BY sport_category, muscle_group, name";
    
    const exercisesResult = await c.env.DB.prepare(exercisesQuery).bind(...params).all();
    const exercises = exercisesResult.results as any[];

    // Group exercises by muscle group and sport category
    const exercisesByGroup: Record<string, any[]> = {};
    const exercisesBySport: Record<string, any[]> = {};
    
    for (const ex of exercises) {
      // By muscle group
      if (!exercisesByGroup[ex.muscle_group]) {
        exercisesByGroup[ex.muscle_group] = [];
      }
      exercisesByGroup[ex.muscle_group].push({
        id: ex.id,
        name: ex.name,
        difficulty: ex.difficulty,
        equipment: ex.equipment,
        sport: ex.sport_category
      });
      
      // By sport category
      if (!exercisesBySport[ex.sport_category]) {
        exercisesBySport[ex.sport_category] = [];
      }
      exercisesBySport[ex.sport_category].push({
        id: ex.id,
        name: ex.name,
        muscle_group: ex.muscle_group,
        difficulty: ex.difficulty,
        equipment: ex.equipment
      });
    }

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
    });

    const isHybrid = workout_type === 'hybrid' && selected_sports && selected_sports.length > 1;
    const isSingleSport = selected_sports && selected_sports.length === 1;
    const sportName = isSingleSport ? selected_sports[0] : null;
    
    // Build sport allocation info for hybrid workouts
    let sportAllocationInfo = '';
    let hybridDaysRules = '';
    
    if (isHybrid && sport_days) {
      sportAllocationInfo = Object.entries(sport_days)
        .map(([sport, days]) => `  - ${sport}: ${days} ${days === 1 ? 'dia' : 'dias'} por semana`)
        .join('\n');
      
      if (allow_mixed_days) {
        const totalDays = Object.values(sport_days).reduce((sum: number, days: any) => sum + days, 0);
        const sportProportions = Object.entries(sport_days)
          .map(([sport, days]: [string, any]) => {
            const percentage = Math.round((days / totalDays) * 100);
            return `${sport}: ${percentage}%`;
          })
          .join(', ');
        
        hybridDaysRules = `**MODO DIAS MISTOS ATIVADO - LEIA COM ATENÇÃO:**

- O usuário QUER combinar múltiplas modalidades no MESMO dia de treino
- Você deve criar ${training_days} dias, onde CADA dia contém exercícios de MÚLTIPLAS modalidades
- A proporção de exercícios entre modalidades deve seguir: ${sportProportions}
- Isso significa que aproximadamente ${sportProportions.split(',')[0].split(':')[1].trim()} dos exercícios devem ser de ${Object.keys(sport_days)[0]}

**EXEMPLOS CORRETOS de como criar os treinos:**
${Object.entries(sport_days).length === 2 ? `
- Dia 1: ${Object.keys(sport_days)[0]} (exercício composto) + ${Object.keys(sport_days)[1]} (técnica) + ${Object.keys(sport_days)[0]} (isolamento) + ${Object.keys(sport_days)[1]} (condicionamento)
- Dia 2: ${Object.keys(sport_days)[1]} (treino principal) + ${Object.keys(sport_days)[0]} (complementar)
- Dia 3: ${Object.keys(sport_days)[0]} (treino principal) + ${Object.keys(sport_days)[1]} (finalizador)` : '- Combine exercícios de diferentes modalidades em cada dia'}

**REGRAS CRÍTICAS PARA DIAS MISTOS:** 
- Em CADA um dos ${training_days} dias, você DEVE incluir exercícios de PELO MENOS 2 modalidades diferentes
- NÃO crie dias com apenas uma modalidade - isso vai contra o pedido do usuário

**REGRA OBRIGATÓRIA PARA MUSCULAÇÃO:**
${selected_sports.includes('Musculação') ? `- Como Musculação está selecionada, você DEVE incluir no mínimo ${Math.ceil(training_days * 0.6)} exercícios de Musculação COMPOSTOS PRINCIPAIS por dia de treino
- PROIBIDO usar apenas abdominais da musculação - você DEVE usar:
  * Exercícios de PEITO: Supino Reto, Supino Inclinado, Crucifixo
  * Exercícios de PERNAS: Agachamento Livre, Leg Press, Stiff
  * Exercícios de COSTAS: Remada Curvada, Puxada, Levantamento Terra
  * Exercícios de OMBROS: Desenvolvimento, Elevação Lateral
  * Exercícios de BRAÇOS: Rosca Direta, Tríceps Pulley
- Os exercícios de abdômen (Abdominal Crunch, etc.) são COMPLEMENTARES, não principais` : ''}

- Distribua os GRUPOS MUSCULARES de forma inteligente entre os dias (peito, costas, pernas, ombros, braços)
- EXEMPLO CORRETO de Dia Misto (Musculação + Boxe):
  * Supino Reto (Musculação - Peito) ← EXERCÍCIO COMPOSTO OBRIGATÓRIO
  * Leg Press (Musculação - Pernas) ← EXERCÍCIO COMPOSTO OBRIGATÓRIO  
  * Shadow Boxing (Boxe - Condicionamento)
  * Remada Curvada (Musculação - Costas) ← EXERCÍCIO COMPOSTO OBRIGATÓRIO
  * Heavy Bag Work (Boxe - Potência)
  * Abdominal Crunch (Musculação - Core) ← Complementar, OK no final
- Mantenha a proporção aproximada de ${sportProportions} mas SEMPRE misture as modalidades`;
      } else {
        hybridDaysRules = `- RESPEITE EXATAMENTE a alocação de dias especificada pelo usuário
- O usuário NÃO QUER dias mistos - cada dia deve ter UMA modalidade principal
${Object.entries(sport_days).map(([sport, days]: [string, any]) => {
  const daysText = days === 1 ? 'dia' : 'dias';
  return `  * ${sport}: ${days} ${daysText} - crie ${days} treino(s) focado(s) principalmente em ${sport}`;
}).join('\n')}
- Cada treino deve ter pelo menos 70-80% dos exercícios da modalidade alocada para aquele dia
- Os dias DEVEM ser claramente identificados pela modalidade principal (ex: "Dia 1 - Musculação", "Dia 2 - Boxe")`;
      }
    }
    
    const hybridInfo = isHybrid ? `

**TREINO HÍBRIDO - MODALIDADES SELECIONADAS:**
${selected_sports.join(', ')}

${sportAllocationInfo ? `**DISTRIBUIÇÃO DE DIAS POR MODALIDADE:**
${sportAllocationInfo}

**IMPORTANTE:** Respeite EXATAMENTE a distribuição de dias escolhida pelo usuário. Se o usuário alocou 3 dias para Musculação e 2 dias para Boxe em um plano de 5 dias, você DEVE criar 3 treinos focados em Musculação e 2 treinos focados em Boxe. Cada treino deve ser predominantemente da modalidade alocada para aquele dia.
` : ''}

${selected_sports.includes('Boxe') || selected_sports.includes('MMA') || selected_sports.includes('Muay Thai') || selected_sports.includes('Jiu-Jitsu') ? `
**IMPORTANTE - LUTAS:**
${selected_sports.filter((s: string) => ['Boxe', 'MMA', 'Muay Thai', 'Jiu-Jitsu'].includes(s)).map((s: string) => {
  if (s === 'Boxe') return '- Boxe: Foco em socos, footwork, condicionamento';
  if (s === 'MMA') return '- MMA: Combinação de striking, wrestling, BJJ - treino completo';
  if (s === 'Muay Thai') return '- Muay Thai: Socos, chutes, joelhadas, clinch';
  if (s === 'Jiu-Jitsu') return '- Jiu-Jitsu: Grappling, submissions, controle no solo';
  return '';
}).join('\n')}
` : ''}
**EXERCÍCIOS DISPONÍVEIS POR MODALIDADE:**
${Object.entries(exercisesBySport).map(([sport, exs]) => 
  `${sport}: ${exs.slice(0, 20).map(e => `${e.name} (ID: ${e.id}, ${e.muscle_group}, ${e.difficulty})`).join(', ')}`
).join('\n')}` : '';

    const singleSportInfo = isSingleSport ? `

**MODALIDADE ESPECÍFICA: ${sportName}**

${['Boxe', 'MMA', 'Muay Thai', 'Jiu-Jitsu'].includes(sportName!) ? `
**CARACTERÍSTICAS DO ${sportName.toUpperCase()}:**
${sportName === 'Boxe' ? '- Boxe: Foco em socos, movimentação, esquivas, condicionamento cardiovascular intenso' : ''}
${sportName === 'MMA' ? '- MMA: Arte marcial mista - combina striking (socos/chutes), wrestling (quedas), e submission grappling' : ''}
${sportName === 'Muay Thai' ? '- Muay Thai: Arte marcial tailandesa - 8 pontos de contato (punhos, cotovelos, joelhos, canelas)' : ''}
${sportName === 'Jiu-Jitsu' ? '- Jiu-Jitsu: Arte marcial brasileira focada em grappling, controle posicional e finalizações' : ''}
` : ''}
**EXERCÍCIOS DISPONÍVEIS:**
${Object.values(exercisesBySport).map(exs => 
  `${exs.slice(0, 30).map(e => `${e.name} (ID: ${e.id}, ${e.muscle_group}, ${e.difficulty})`).join(', ')}`
).join('\n')}` : '';

    const prompt = `Você é um personal trainer IFBB Pro com PhD em Ciências do Exercício${isHybrid ? ' e especialista em treinamento funcional híbrido' : isSingleSport ? ` e especialista em ${sportName}` : ''}. Crie um plano de treino COMPLETO, CIENTÍFICO e PROFISSIONAL:

**PERFIL DO CLIENTE:**
- Tipo de treino: ${isHybrid ? 'HÍBRIDO - Combinando múltiplas modalidades' : isSingleSport ? `ESPECÍFICO - ${sportName}` : 'TRADICIONAL - Musculação'}
- Nível: ${experience_level}
- Objetivo: ${primary_goal}
- Dias de treino por semana: ${training_days}
${isHybrid && sport_days ? `- Distribuição de dias: ${Object.entries(sport_days).map(([sport, days]: [string, any]) => `${sport} (${days} dias)`).join(', ')}` : ''}
- Lesões/Restrições: ${injuries || 'Nenhuma'}
- Equipamentos disponíveis: ${equipment || 'Academia completa'}
- Tempo por sessão: ${time_per_session || '60-90'} minutos
${hybridInfo}
${singleSportInfo}

${!isHybrid && !isSingleSport ? `**EXERCÍCIOS DISPONÍVEIS POR GRUPO MUSCULAR:**
${Object.entries(exercisesByGroup).map(([group, exs]) => 
  `${group}: ${exs.map(e => `${e.name} (ID: ${e.id}, ${e.equipment}, ${e.difficulty})`).slice(0, 15).join(', ')}`
).join('\n')}` : ''}

**INSTRUÇÕES CRÍTICAS - LEIA COM ATENÇÃO:**

${isHybrid ? `**REGRAS ESPECÍFICAS PARA TREINO HÍBRIDO:**
${hybridDaysRules || '- INTEGRE as modalidades de forma INTELIGENTE e COMPLEMENTAR\n- Distribua os exercícios das diferentes modalidades ao longo da semana\n- VARIE as modalidades entre os dias para evitar sobrecarga'}
- Combine força/resistência com condicionamento/agilidade/flexibilidade
- Use exercícios funcionais que transferem entre as modalidades
${selected_sports.some((s: string) => ['Boxe', 'MMA', 'Muay Thai', 'Jiu-Jitsu'].includes(s)) ? `- Para LUTAS: respeite as características específicas de cada arte marcial
  * Boxe: Trabalho de socos, movimentação, condicionamento explosivo
  * MMA: Integração de striking + wrestling + grappling
  * Muay Thai: 8 pontos de contato, clinch, potência de pernas
  * Jiu-Jitsu: Grappling, controle posicional, força de core
  * Se o usuário escolheu apenas uma luta, trate como ESPECIALIZAÇÃO naquela arte` : ''}
- Exemplo de distribuição semanal (3 dias):
  * Dia 1: 60% Modalidade A + 40% Condicionamento/Funcional
  * Dia 2: Modalidade B integrada com exercícios de performance
  * Dia 3: Mix de modalidades com foco no objetivo principal
- Mantenha COERÊNCIA: os exercícios devem trabalhar juntos para o objetivo
- PRIORIZE qualidade técnica sobre quantidade de modalidades por dia

` : isSingleSport ? `**REGRAS ESPECÍFICAS PARA ${sportName.toUpperCase()}:**
- Use APENAS exercícios de ${sportName} da lista fornecida
- Adapte os princípios de treino para as características específicas desta modalidade
- Foque em exercícios que desenvolvem as habilidades e qualidades físicas específicas
- Combine trabalho técnico, físico e tático quando apropriado
- Mantenha os princípios científicos de periodização e progressão

` : ''}1. **QUANTIDADE DE EXERCÍCIOS (OBRIGATÓRIO):**
   - Iniciante: 6-7 exercícios por treino
   - Intermediário: 7-9 exercícios por treino
   - Avançado: 9-12 exercícios por treino
   - NUNCA crie treinos com menos de 6 exercícios
   - Distribua o volume entre compostos e isolamento

2. **SELEÇÃO INTELIGENTE E COMPLEMENTAR:**
   - SEMPRE comece com 2-3 exercícios compostos principais
   - Adicione 2-3 exercícios compostos secundários/auxiliares
   - Complete com 3-4 exercícios de isolamento
   - Exercícios devem se COMPLEMENTAR, não repetir ângulos:
     * Peito: Supino reto + Supino inclinado + Crucifixo + Peck deck (4 ângulos diferentes)
     * Costas: Puxada + Remada + Pullover + Remada unilateral (largura + espessura)
     * Pernas: Agachamento + Leg press + Cadeira extensora + Mesa flexora + Panturrilha
     * Ombros: Desenvolvimento + Elevação lateral + Elevação frontal + Crucifixo inverso
   - Varie pegadas, ângulos, tipos de movimento
   - Inclua trabalho unilateral quando apropriado

3. **ORDEM DOS EXERCÍCIOS (CIÊNCIA):**
   - 1º: Compostos pesados (força/potência)
   - 2º: Compostos auxiliares (volume)
   - 3º: Isolamento multi-articular
   - 4º: Isolamento mono-articular
   - 5º: Exercícios de finalização/bomba
   
4. **DIVISÃO DE TREINO OTIMIZADA:**
${isHybrid ? `   - HÍBRIDO - Integre as modalidades de forma equilibrada:
   * 3 dias: Força/Condicionamento / Técnica/Agilidade / Performance/Resistência
   * 4 dias: Força A / Condicionamento / Força B / Performance
   * 5+ dias: Alterne entre modalidades mantendo 1-2 dias de recuperação ativa` : `   - 3 dias: Push (Peito/Ombros/Tríceps 7 ex) / Pull (Costas/Bíceps 7 ex) / Legs (Pernas completas 8 ex)
   - 4 dias: Upper Push 8 ex / Lower 8 ex / Upper Pull 8 ex / Ombros/Braços 7 ex
   - 5 dias: Peito/Tríceps 8 ex / Costas/Bíceps 9 ex / Ombros 7 ex / Pernas 9 ex / Braços/Core 7 ex
   - 6 dias: Push 8 ex / Pull 8 ex / Legs 9 ex / Push 7 ex / Pull 7 ex / Legs 7 ex`}

5. **PARÂMETROS POR OBJETIVO:**
   - Hipertrofia: 3-4 séries, 8-12 reps, 60-90s descanso
   - Força: 4-5 séries, 3-6 reps, 180-300s descanso
   - Resistência: 2-3 séries, 15-20 reps, 30-60s descanso
   - Perda de Peso: 3-4 séries, 12-15 reps, 45-60s descanso

6. **PROGRESSÃO E VOLUME:**
   - Iniciante: Menor carga, foco técnica, 15-18 séries/grupo muscular
   - Intermediário: Carga moderada-alta, 18-22 séries/grupo muscular
   - Avançado: Carga máxima, técnicas avançadas, 20-25 séries/grupo muscular

7. **VARIEDADE DE ESTÍMULOS:**
   - Misture exercícios com máquinas, pesos livres, cabos
   - Varie ranges de movimento (parcial, completo, alongado)
   - Inclua diferentes tipos de contração
   - Use exercícios bilaterais E unilaterais

8. **EXERCÍCIOS OBRIGATÓRIOS POR GRUPO:**
   - Peito: Pelo menos 1 supino + 1 fly/crucifixo
   - Costas: Pelo menos 1 puxada vertical + 1 remada horizontal
   - Pernas: Pelo menos 1 squat pattern + 1 hinge pattern + 1 isolamento quadríceps + 1 isolamento posterior
   - Ombros: Pelo menos 1 press + 2 elevações laterais/raises
   - Braços: Pelo menos 2 exercícios bíceps + 2 exercícios tríceps (se dia específico)

Retorne JSON com:
{
  "profile": {
    "experience_level": string,
    "primary_goal": string,
    "training_days": number
  },
  "plan": {
    "name": "Nome do Plano (criativo e motivacional)",
    "description": "Descrição detalhada da estratégia e periodização"
  },
  "days": [
    {
      "day_number": number (1 a ${training_days}),
      "focus": "Foco do dia (ex: Peito e Tríceps)",
      "exercises": [
        {
          "id": number (ID do exercício da lista),
          "name": string (nome exato do exercício),
          "muscle_group": string,
          "equipment": string,
          "sets": number,
          "reps": string (ex: "8-12" ou "3-5"),
          "rest_seconds": number,
          "notes": "Dicas técnicas específicas para este exercício"
        }
      ]
    }
  ]
}

IMPORTANTE: Use apenas IDs de exercícios que existem na lista fornecida. Seja preciso e profissional.`;

    // Retry logic with exponential backoff for OpenAI API calls
    let workoutPlan: any = null;
    let lastError: any = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Você é um personal trainer certificado especializado em periodização e programação de treinos. Sempre responda com JSON válido e seja extremamente preciso com IDs de exercícios. IMPORTANTE: Retorne APENAS JSON válido, sem texto adicional."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 3000,
          temperature: 0.3, // Lower temperature for more consistent output
          seed: 12345 // Use seed for more deterministic responses
        });

        const content = response.choices[0].message.content || "{}";
        
        // Try to parse the JSON
        try {
          workoutPlan = JSON.parse(content);
          
          // Validate the structure
          if (!workoutPlan.days || !Array.isArray(workoutPlan.days)) {
            throw new Error("Invalid workout plan structure: missing or invalid 'days' array");
          }
          
          // Validate all exercise IDs exist
          const validExerciseIds = new Set(exercises.map(e => e.id));
          for (const day of workoutPlan.days) {
            if (!day.exercises || !Array.isArray(day.exercises)) {
              throw new Error(`Invalid day structure: day ${day.day_number} missing exercises array`);
            }
            day.exercises = day.exercises.filter((ex: any) => validExerciseIds.has(ex.id));
          }
          
          // If we got here, the plan is valid
          break;
        } catch (parseError: any) {
          lastError = parseError;
          console.error(`Attempt ${attempt} - JSON parse error:`, parseError.message);
          console.error('Received content:', content.substring(0, 500));
          
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
      } catch (apiError: any) {
        lastError = apiError;
        console.error(`Attempt ${attempt} - OpenAI API error:`, apiError);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }
    
    // If all retries failed, return error
    if (!workoutPlan) {
      console.error("All retry attempts failed. Last error:", lastError);
      return c.json({ 
        error: "Não foi possível gerar o treino após várias tentativas. Por favor, tente novamente em alguns instantes."
      }, 500);
    }

    return c.json(workoutPlan);
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    if (error?.status === 401) {
      return c.json({ 
        error: "Chave da API OpenAI inválida."
      }, 401);
    }
    
    return c.json({ 
      error: error?.message || "Erro ao gerar treino. Tente novamente."
    }, 500);
  }
});

// Save workout profile and plan
app.post("/api/workout-save", async (c) => {
  const body = await c.req.json();
  const { profile, plan, days } = body;

  // Insert profile
  const profileResult = await c.env.DB.prepare(
    `INSERT INTO workout_profiles (experience_level, primary_goal, training_days) 
     VALUES (?, ?, ?) RETURNING *`
  ).bind(profile.experience_level, profile.primary_goal, profile.training_days).first();

  if (!profileResult) {
    return c.json({ error: "Failed to create profile" }, 500);
  }

  const profileId = profileResult.id as number;

  // Insert plan
  const planResult = await c.env.DB.prepare(
    `INSERT INTO workout_plans (profile_id, name, description) 
     VALUES (?, ?, ?) RETURNING *`
  ).bind(profileId, plan.name, plan.description).first();

  if (!planResult) {
    return c.json({ error: "Failed to create plan" }, 500);
  }

  const planId = planResult.id as number;

  // Insert exercises
  for (const day of days) {
    let orderIndex = 0;
    for (const exercise of day.exercises) {
      await c.env.DB.prepare(
        `INSERT INTO workout_plan_exercises 
         (plan_id, exercise_id, day_number, sets, reps, rest_seconds, order_index) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(planId, exercise.id, day.day_number, exercise.sets, exercise.reps, exercise.rest_seconds, orderIndex).run();
      orderIndex++;
    }
  }

  return c.json({ profile: profileResult, plan: planResult });
});

// Get workout plan by profile ID
app.get("/api/workout-plan/:profileId", async (c) => {
  const profileId = c.req.param("profileId");

  const plan = await c.env.DB.prepare(
    "SELECT * FROM workout_plans WHERE profile_id = ?"
  ).bind(profileId).first();

  if (!plan) {
    return c.json({ error: "Plan not found" }, 404);
  }

  const exercises = await c.env.DB.prepare(
    `SELECT wpe.*, e.* FROM workout_plan_exercises wpe
     JOIN exercises e ON wpe.exercise_id = e.id
     WHERE wpe.plan_id = ?
     ORDER BY wpe.day_number, wpe.order_index`
  ).bind(plan.id).all();

  // Group by day
  const days: Record<number, any[]> = {};
  for (const ex of exercises.results) {
    const dayNum = (ex as any).day_number as number;
    if (!days[dayNum]) {
      days[dayNum] = [];
    }
    days[dayNum].push(ex);
  }

  const daysArray = Object.keys(days).map(dayNum => ({
    day_number: parseInt(dayNum),
    exercises: days[parseInt(dayNum)]
  }));

  return c.json({ ...plan, days: daysArray });
});

// Create workout log
app.post("/api/workout-log", async (c) => {
  const body = await c.req.json();
  const { plan_id, day_number, exercises } = body;

  // Create the log entry
  const logResult = await c.env.DB.prepare(
    `INSERT INTO workout_logs (plan_id, day_number) VALUES (?, ?) RETURNING *`
  ).bind(plan_id, day_number).first();

  if (!logResult) {
    return c.json({ error: "Failed to create log" }, 500);
  }

  const logId = logResult.id;

  // Insert exercise logs
  for (const ex of exercises) {
    await c.env.DB.prepare(
      `INSERT INTO workout_log_exercises 
       (log_id, plan_exercise_id, weight_kg, reps_completed, notes) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(logId, ex.plan_exercise_id, ex.weight_kg, ex.reps_completed, ex.notes).run();
  }

  return c.json({ log: logResult });
});

// Get workout logs for a plan
app.get("/api/workout-logs/:planId", async (c) => {
  const planId = c.req.param("planId");

  const logs = await c.env.DB.prepare(
    `SELECT wl.*, 
       (SELECT COUNT(*) FROM workout_log_exercises WHERE log_id = wl.id) as exercise_count
     FROM workout_logs wl
     WHERE wl.plan_id = ?
     ORDER BY wl.completed_at DESC`
  ).bind(planId).all();

  return c.json(logs.results);
});

// Get workout log details with exercises
app.get("/api/workout-log/:logId", async (c) => {
  const logId = c.req.param("logId");

  const log = await c.env.DB.prepare(
    "SELECT * FROM workout_logs WHERE id = ?"
  ).bind(logId).first();

  if (!log) {
    return c.json({ error: "Log not found" }, 404);
  }

  const exercises = await c.env.DB.prepare(
    `SELECT wle.*, e.name, e.muscle_group, wpe.sets, wpe.reps
     FROM workout_log_exercises wle
     JOIN workout_plan_exercises wpe ON wle.plan_exercise_id = wpe.id
     JOIN exercises e ON wpe.exercise_id = e.id
     WHERE wle.log_id = ?
     ORDER BY wpe.order_index`
  ).bind(logId).all();

  return c.json({ ...log, exercises: exercises.results });
});

// Get all user's workout plans
app.get("/api/my-workouts", async (c) => {
  const plans = await c.env.DB.prepare(
    `SELECT wp.*, wpr.*
     FROM workout_plans wp
     JOIN workout_profiles wpr ON wp.profile_id = wpr.id
     ORDER BY wp.created_at DESC`
  ).all();

  const results = plans.results.map((row: any) => ({
    id: row.id,
    profile_id: row.profile_id,
    name: row.name,
    description: row.description,
    created_at: row.created_at,
    profile: {
      id: row.profile_id,
      experience_level: row.experience_level,
      primary_goal: row.primary_goal,
      training_days: row.training_days,
      created_at: row.created_at
    }
  }));

  return c.json(results);
});

// Delete workout plan and profile
app.delete("/api/workout-plan/:profileId", async (c) => {
  const profileId = c.req.param("profileId");

  const plan = await c.env.DB.prepare(
    "SELECT * FROM workout_plans WHERE profile_id = ?"
  ).bind(profileId).first();

  if (!plan) {
    return c.json({ error: "Plan not found" }, 404);
  }

  const planId = (plan as any).id;

  // Delete in order: log exercises, logs, plan exercises, plan, profile
  await c.env.DB.prepare(
    `DELETE FROM workout_log_exercises 
     WHERE log_id IN (SELECT id FROM workout_logs WHERE plan_id = ?)`
  ).bind(planId).run();

  await c.env.DB.prepare(
    "DELETE FROM workout_logs WHERE plan_id = ?"
  ).bind(planId).run();

  await c.env.DB.prepare(
    "DELETE FROM workout_plan_exercises WHERE plan_id = ?"
  ).bind(planId).run();

  await c.env.DB.prepare(
    "DELETE FROM workout_plans WHERE id = ?"
  ).bind(planId).run();

  await c.env.DB.prepare(
    "DELETE FROM workout_profiles WHERE id = ?"
  ).bind(profileId).run();

  return c.json({ success: true });
});

// Replace exercise in workout plan
app.put("/api/replace-exercise/:planExerciseId", async (c) => {
  const planExerciseId = c.req.param("planExerciseId");
  const body = await c.req.json();
  const { new_exercise_id } = body;

  await c.env.DB.prepare(
    "UPDATE workout_plan_exercises SET exercise_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(new_exercise_id, planExerciseId).run();

  return c.json({ success: true });
});

// Get exercise history with past logs
app.get("/api/exercise-history/:profileId", async (c) => {
  const profileId = c.req.param("profileId");

  const plan = await c.env.DB.prepare(
    "SELECT * FROM workout_plans WHERE profile_id = ?"
  ).bind(profileId).first();

  if (!plan) {
    return c.json([]);
  }

  const planId = (plan as any).id;

  // Get all exercises in the plan
  const exercises = await c.env.DB.prepare(
    `SELECT wpe.*, e.name, e.muscle_group
     FROM workout_plan_exercises wpe
     JOIN exercises e ON wpe.exercise_id = e.id
     WHERE wpe.plan_id = ?
     ORDER BY wpe.day_number, wpe.order_index`
  ).bind(planId).all();

  // For each exercise, get its log history
  const exercisesWithHistory = [];
  for (const exercise of exercises.results) {
    const logs = await c.env.DB.prepare(
      `SELECT wl.id as log_id, wl.completed_at, wle.weight_kg, wle.reps_completed, wle.notes
       FROM workout_log_exercises wle
       JOIN workout_logs wl ON wle.log_id = wl.id
       WHERE wle.plan_exercise_id = ?
       ORDER BY wl.completed_at DESC
       LIMIT 10`
    ).bind((exercise as any).id).all();

    exercisesWithHistory.push({
      ...exercise,
      history: logs.results.map((log: any) => ({
        log_id: log.log_id,
        date: log.completed_at,
        weight_kg: log.weight_kg,
        reps_completed: log.reps_completed,
        notes: log.notes
      }))
    });
  }

  return c.json(exercisesWithHistory);
});

// AI Chat endpoint
app.post("/api/chat", async (c) => {
  const body = await c.req.json();
  const { message, mode, language, history } = body;

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ 
      error: "API OpenAI não configurada. Configure a chave OPENAI_API_KEY."
    }, 503);
  }

  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });

  const languageMap: Record<string, string> = {
    'pt': 'Português do Brasil',
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'ja': '日本語',
    'zh': '中文'
  };

  const userLanguage = languageMap[language] || 'English';

  const systemPrompt = mode === 'workout'
    ? `You are an expert personal trainer and exercise scientist with extensive knowledge of biomechanics, training methodologies, and sports medicine. Provide complete, objective, and scientifically accurate answers about exercises, workout techniques, training programs, recovery, injury prevention, and fitness. Be direct and authoritative - avoid hedging or uncertain language. Base your responses on established exercise science, sports medicine research, and evidence-based training principles. Always respond in ${userLanguage}. Deliver comprehensive yet concise answers in 3-5 paragraphs. Focus on facts, proper technique, and proven methods. When discussing safety or injury risks, be clear and specific about proper form and precautions.`
    : `You are an expert nutritionist and registered dietitian with deep knowledge of biochemistry, metabolism, and evidence-based nutrition science. Provide complete, objective, and scientifically accurate answers about nutrition, macronutrients, meal planning, supplements, dietary needs, and health optimization. Be direct and authoritative - avoid hedging or uncertain language. Base your responses on peer-reviewed research, established nutritional science, and clinical nutrition guidelines. Always respond in ${userLanguage}. Deliver comprehensive yet concise answers in 3-5 paragraphs. Focus on facts, scientific evidence, and proven nutritional strategies. When discussing health recommendations, be clear and specific about evidence-based approaches.`;

  try {
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add chat history (limit to last 10 messages for context)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.3
    });

    return c.json({ 
      response: response.choices[0].message.content || "Desculpe, não consegui processar sua mensagem."
    });
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    if (error?.status === 401) {
      return c.json({ 
        error: "Chave da API OpenAI inválida. Verifique se a chave está configurada corretamente."
      }, 401);
    }
    
    return c.json({ 
      error: error?.message || "Erro ao processar mensagem. Tente novamente."
    }, 500);
  }
});

// ===== NUTRITION API ENDPOINTS =====

// Get all foods from database
app.get("/api/food-database", async (c) => {
  const category = c.req.query("category");
  
  let sql = "SELECT * FROM food_database WHERE 1=1";
  const params: string[] = [];
  
  if (category && category !== 'all') {
    sql += " AND category = ?";
    params.push(category);
  }
  
  sql += " ORDER BY category, name ASC";
  
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(result.results);
});

// Search foods
app.get("/api/food-database/search", async (c) => {
  const query = c.req.query("q");
  
  if (!query) {
    return c.json([]);
  }
  
  const result = await c.env.DB.prepare(
    "SELECT * FROM food_database WHERE name LIKE ? ORDER BY name ASC LIMIT 20"
  ).bind(`%${query}%`).all();
  
  return c.json(result.results);
});

// Create nutrition profile
app.post("/api/nutrition-profile", async (c) => {
  const body = await c.req.json();
  const { age, gender, weight_kg, height_cm, activity_level, goal, tmb, ndc } = body;

  const result = await c.env.DB.prepare(
    `INSERT INTO nutrition_profiles (age, gender, weight_kg, height_cm, activity_level, goal, tmb, ndc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(age, gender, weight_kg, height_cm, activity_level, goal, tmb, ndc).first();

  return c.json(result);
});

// Get latest nutrition profile
app.get("/api/nutrition-profile/latest", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM nutrition_profiles ORDER BY created_at DESC LIMIT 1"
  ).first();

  return c.json(result);
});

// Analyze exercise form from video
app.post("/api/analyze-form", async (c) => {
  const formData = await c.req.formData();
  const videoFile = formData.get('video') as File;

  if (!videoFile) {
    return c.json({ error: "No video provided" }, 400);
  }

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ 
      error: "API OpenAI não configurada. Configure a chave OPENAI_API_KEY."
    }, 503);
  }

  try {
    // Convert video to base64
    const videoBuffer = await videoFile.arrayBuffer();
    const uint8Array = new Uint8Array(videoBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Video = btoa(binaryString);

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this exercise form video and provide detailed feedback in JSON format with these fields:
- exercise_identified: Name of the exercise being performed (in Portuguese)
- overall_assessment: Brief overall assessment of the form (2-3 sentences in Portuguese)
- good_points: Array of strings describing what the person is doing correctly (in Portuguese)
- areas_for_improvement: Array of strings describing what could be improved (in Portuguese)
- safety_concerns: Array of strings describing any safety issues or injury risks (in Portuguese)
- recommendations: Array of specific actionable recommendations (in Portuguese)

Be constructive, encouraging, and focus on both positives and areas for improvement. If you cannot clearly see the exercise or the video quality is poor, mention that in the overall_assessment.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${videoFile.type};base64,${base64Video}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return c.json(analysis);
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    if (error?.status === 401) {
      return c.json({ 
        error: "Chave da API OpenAI inválida. Verifique se a chave está configurada corretamente."
      }, 401);
    }
    
    return c.json({ 
      error: error?.message || "Erro ao analisar vídeo. Tente novamente."
    }, 500);
  }
});

// Scan bioimpedance paper
app.post("/api/scan-bioimpedance", async (c) => {
  const formData = await c.req.formData();
  const imageFile = formData.get('image') as File;

  if (!imageFile) {
    return c.json({ error: "No image provided" }, 400);
  }

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ 
      error: "API OpenAI não configurada. Configure a chave OPENAI_API_KEY."
    }, 503);
  }

  try {
    const imageBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Image = btoa(binaryString);

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract bioimpedance data from this paper/report image and return in JSON format with these exact field names (use null if not found):
- weight_kg: Weight in kilograms (number)
- body_fat_percentage: Body fat percentage (number)
- muscle_mass_kg: Muscle mass in kilograms (number)
- water_percentage: Body water percentage (number)
- bone_mass_kg: Bone mass in kilograms (number or null)
- visceral_fat_level: Visceral fat level (integer or null)
- bmr: Basal Metabolic Rate in kcal (number or null)
- metabolic_age: Metabolic age in years (integer or null)

Look for common bioimpedance terms in Portuguese like: peso, gordura corporal, massa muscular, água corporal, massa óssea, gordura visceral, TMB, idade metabólica, etc. Extract only numeric values.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageFile.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    return c.json(data);
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    if (error?.status === 401) {
      return c.json({ 
        error: "Chave da API OpenAI inválida. Verifique se a chave está configurada corretamente."
      }, 401);
    }
    
    return c.json({ 
      error: error?.message || "Erro ao escanear papel. Certifique-se que a imagem está legível e tente novamente."
    }, 500);
  }
});

// Analyze food from image with MAXIMUM PRECISION
app.post("/api/analyze-food", async (c) => {
  const formData = await c.req.formData();
  const imageFile = formData.get('image') as File;
  const language = formData.get('language') as string || 'pt';

  if (!imageFile) {
    return c.json({ error: "No image provided" }, 400);
  }

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ 
      error: "API OpenAI não configurada. Configure a chave OPENAI_API_KEY."
    }, 503);
  }

  const languageInstructions: Record<string, string> = {
    'pt': 'em Português do Brasil',
    'en': 'in English',
    'es': 'en Español',
    'fr': 'en Français',
    'de': 'auf Deutsch',
    'it': 'in Italiano',
    'ja': '日本語で',
    'zh': '用中文'
  };

  const langInstruction = languageInstructions[language] || languageInstructions['en'];

  try {
    const imageBuffer = await imageFile.arrayBuffer();
    
    // Convert ArrayBuffer to base64 safely for large images
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Image = btoa(binaryString);

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um nutricionista profissional certificado com expertise em análise visual de alimentos e cálculo preciso de macronutrientes. Sua especialidade é estimar porções e composição nutricional com MÁXIMA PRECISÃO baseando-se em:

1. Bancos de dados nutricionais oficiais (USDA, TACO Brasil, TBCA)
2. Conhecimento profundo de densidade e composição de alimentos
3. Análise visual treinada para estimar pesos e volumes
4. Compreensão de métodos de preparo e seus impactos nos macros

NUNCA estime de forma grosseira. Seja EXTREMAMENTE específico e preciso.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta imagem de alimento com PRECISÃO PROFISSIONAL e retorne JSON ${langInstruction}:

**ANÁLISE OBRIGATÓRIA:**

1. **IDENTIFICAÇÃO ESPECÍFICA:**
   - Não apenas "frango" → "peito de frango grelhado sem pele"
   - Não apenas "arroz" → "arroz integral cozido"
   - Identifique cortes, preparos, temperos visíveis

2. **ESTIMATIVA DE PESO (use referências visuais):**
   - Tamanho do prato (normalmente 25-28cm diâmetro)
   - Talheres (garfo ≈ 19cm, colher ≈ 20cm)
   - Espessura e densidade do alimento
   - Compare com porções conhecidas
   - SEMPRE em gramas exatas (não "aproximadamente")

3. **MÉTODO DE PREPARO:**
   - Grelhado, frito, assado, cozido?
   - Óleo adicionado? Quanto (estimar)?
   - Molhos? Temperos calóricos?

4. **CÁLCULO DE MACROS (baseado em tabelas oficiais):**
   - Use valores PRECISOS do USDA/TACO
   - Ajuste para método de preparo
   - Considere perdas de água no cozimento
   - Some calorias de óleo/molhos

**FORMATO JSON:**
{
  "name": "Nome específico e detalhado do alimento",
  "portion_size": "Peso em gramas + descrição (ex: '180g de peito de frango grelhado')",
  "calories": número (total exato),
  "protein": número (gramas, 1 casa decimal),
  "carbs": número (gramas, 1 casa decimal),
  "fat": número (gramas, 1 casa decimal),
  "confidence": "high/medium/low (baseado na qualidade da imagem)",
  "preparation_notes": "Detalhes sobre preparo que afetam macros"
}

Se houver múltiplos itens, combine tudo em um único objeto com totais somados.

LEMBRE-SE: Precisão é CRÍTICA. Use seu conhecimento profissional de nutrição.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageFile.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.2 // Lower temperature for more consistent, accurate results
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return c.json(analysis);
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    if (error?.status === 401) {
      return c.json({ 
        error: "Chave da API OpenAI inválida. Verifique se a chave está configurada corretamente."
      }, 401);
    }
    
    return c.json({ 
      error: error?.message || "Erro ao analisar imagem. Tente novamente."
    }, 500);
  }
});

// Generate diet plan from user profile with MAXIMUM PRECISION
app.post("/api/generate-diet-from-profile", async (c) => {
  const body = await c.req.json();
  const { 
    weight_kg, 
    height_cm, 
    age, 
    gender, 
    activity_level, 
    goal, 
    tmb, 
    ndc, 
    food_preferences, 
    restrictions, 
    meals_per_day, 
    language 
  } = body;

  if (!weight_kg || !height_cm) {
    return c.json({ error: "Weight and height are required" }, 400);
  }

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ 
      error: "API OpenAI não configurada. Configure a chave OPENAI_API_KEY."
    }, 503);
  }

  // Create a temporary nutrition profile
  const profile = await c.env.DB.prepare(
    `INSERT INTO nutrition_profiles (age, gender, weight_kg, height_cm, activity_level, goal, tmb, ndc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(age, gender, weight_kg, height_cm, activity_level, goal, tmb, ndc).first();

  if (!profile) {
    return c.json({ error: "Failed to create nutrition profile" }, 500);
  }

  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });

  const profileData = profile as any;
  const profile_id = profileData.id;
  
  const languageInstructions: Record<string, { lang: string, meals: string[] }> = {
    'pt': { 
      lang: 'Português do Brasil', 
      meals: ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia']
    },
    'en': { 
      lang: 'English', 
      meals: ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Late Snack']
    },
    'es': { 
      lang: 'Español', 
      meals: ['Desayuno', 'Merienda Mañana', 'Almuerzo', 'Merienda Tarde', 'Cena', 'Colación']
    }
  };

  const langConfig = languageInstructions[language] || languageInstructions['pt'];
  
  const dailyProtein = Math.round(weight_kg * 2);
  const dailyCarbs = Math.round((ndc * 0.45) / 4);
  const dailyFat = Math.round((ndc * 0.25) / 9);
  
  const prompt = `Você é um nutricionista profissional especializado em planejamento alimentar. Crie um plano diário PRECISO E PROFISSIONAL em ${langConfig.lang}:

**PERFIL DO CLIENTE:**
- Meta calórica diária: ${ndc} kcal
- Meta de proteína: ${dailyProtein}g
- Meta de carboidratos: ${dailyCarbs}g
- Meta de gorduras: ${dailyFat}g
- Objetivo: ${goal}
- Refeições por dia: ${meals_per_day}
- Preferências: ${food_preferences || 'Nenhuma especificada'}
- Restrições: ${restrictions || 'Nenhuma'}

**REGRAS OBRIGATÓRIAS:**

1. **QUANTIDADES EXATAS:**
   - SEMPRE especifique peso em gramas ou unidades padrão
   - Exemplos corretos:
     * "150g de arroz integral cozido"
     * "120g de peito de frango grelhado"
     * "2 ovos inteiros grandes (100g)"
     * "200ml de leite desnatado"
     * "1 banana média (100g)"
   - NUNCA use termos vagos como "porção", "a gosto", "quantidade média"

2. **CÁLCULO PRECISO DE MACROS:**
   - Use tabelas USDA/TACO para cada alimento
   - Some EXATAMENTE as calorias de cada item
   - Os macros da refeição DEVEM bater com os alimentos listados
   - Margem de erro máxima: ±5%

3. **DISTRIBUIÇÃO INTELIGENTE:**
   - Café da manhã: 25-30% das calorias
   - Almoço: 30-35% das calorias
   - Jantar: 25-30% das calorias
   - Lanches: Restante distribuído

4. **VARIEDADE E PRATICIDADE:**
   - Alimentos reais e acessíveis
   - Preparos simples
   - Respeite preferências e restrições

**FORMATO JSON:**
{
  "name": "Nome criativo para a dieta (ex: 'Plano de Hipertrofia Equilibrado')",
  "description": "Descrição profissional da estratégia nutricional (1-2 frases)",
  "meals": [
    {
      "meal_type": "${langConfig.meals[0]}" (um dos ${meals_per_day} tipos de refeição),
      "meal_name": "Nome descritivo da refeição",
      "foods": "Lista formatada de alimentos, um por linha, com QUANTIDADES EXATAS:\\n- 150g de arroz integral cozido\\n- 120g de peito de frango grelhado\\n- 100g de brócolis cozido\\n- 1 colher de sopa de azeite (10ml)",
      "calories": número_exato,
      "protein": número_decimal,
      "carbs": número_decimal,
      "fat": número_decimal
    }
  ]
}

As ${meals_per_day} refeições DEVEM somar aproximadamente ${ndc} kcal, ${dailyProtein}g proteína, ${dailyCarbs}g carbs, ${dailyFat}g gordura.

IMPORTANTE: Seja EXTREMAMENTE preciso. Este é um plano profissional que o cliente vai seguir.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um nutricionista certificado especializado em planejamento alimentar preciso e personalizado. 

IDIOMA OBRIGATÓRIO: ${langConfig.lang}
- TODO o conteúdo da resposta (name, description, meal_name, foods) DEVE estar EXCLUSIVAMENTE em ${langConfig.lang}
- NUNCA misture idiomas ou use inglês
- Sempre responda com JSON válido
- Seja EXTREMAMENTE específico com quantidades e cálculos nutricionais`
        },
        {
          role: "user",
          content: `${prompt}

CRÍTICO: Toda a sua resposta DEVE estar em ${langConfig.lang}. Não use inglês ou outros idiomas em nenhuma parte do JSON.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
      temperature: 0.4
    });

    const dietPlan = JSON.parse(response.choices[0].message.content || "{}");

    // Save diet plan to database
    const planResult = await c.env.DB.prepare(
      `INSERT INTO diet_plans (profile_id, name, description, daily_calories, daily_protein, daily_carbs, daily_fat)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
      profile_id,
      dietPlan.name,
      dietPlan.description,
      ndc,
      dailyProtein,
      dailyCarbs,
      dailyFat
    ).first();

    const planId = (planResult as any).id;

    // Save meals
    let orderIndex = 0;
    for (const meal of dietPlan.meals) {
      const foodsText = Array.isArray(meal.foods) 
        ? meal.foods.join('\n') 
        : typeof meal.foods === 'string' 
          ? meal.foods 
          : JSON.stringify(meal.foods);
      
      await c.env.DB.prepare(
        `INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, foods, calories, protein, carbs, fat, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        planId,
        meal.meal_type,
        meal.meal_name,
        foodsText,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        orderIndex
      ).run();
      orderIndex++;
    }

    return c.json(planResult);
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    if (error?.status === 401) {
      return c.json({ 
        error: "Chave da API OpenAI inválida. Verifique se a chave está configurada corretamente."
      }, 401);
    }
    
    return c.json({ 
      error: error?.message || "Erro ao gerar plano de dieta. Tente novamente."
    }, 500);
  }
});

// Generate diet plan with MAXIMUM PRECISION (legacy endpoint - kept for compatibility)
app.post("/api/generate-diet", async (c) => {
  const body = await c.req.json();
  const { profile_id, food_preferences, restrictions, meals_per_day, language } = body;

  const profile = await c.env.DB.prepare(
    "SELECT * FROM nutrition_profiles WHERE id = ?"
  ).bind(profile_id).first();

  if (!profile) {
    return c.json({ error: "Profile not found" }, 404);
  }

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ 
      error: "API OpenAI não configurada. Configure a chave OPENAI_API_KEY."
    }, 503);
  }

  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });

  const profileData = profile as any;
  
  const languageInstructions: Record<string, { lang: string, meals: string[] }> = {
    'pt': { 
      lang: 'Português do Brasil', 
      meals: ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia']
    },
    'en': { 
      lang: 'English', 
      meals: ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Late Snack']
    },
    'es': { 
      lang: 'Español', 
      meals: ['Desayuno', 'Merienda Mañana', 'Almuerzo', 'Merienda Tarde', 'Cena', 'Colación']
    }
  };

  const langConfig = languageInstructions[language] || languageInstructions['en'];
  
  const dailyProtein = Math.round(profileData.weight_kg * 2);
  const dailyCarbs = Math.round((profileData.ndc * 0.45) / 4);
  const dailyFat = Math.round((profileData.ndc * 0.25) / 9);
  
  const prompt = `Você é um nutricionista profissional especializado em planejamento alimentar. Crie um plano diário PRECISO E PROFISSIONAL em ${langConfig.lang}:

**PERFIL DO CLIENTE:**
- Meta calórica diária: ${profileData.ndc} kcal
- Meta de proteína: ${dailyProtein}g
- Meta de carboidratos: ${dailyCarbs}g
- Meta de gorduras: ${dailyFat}g
- Objetivo: ${profileData.goal}
- Refeições por dia: ${meals_per_day}
- Preferências: ${food_preferences || 'Nenhuma especificada'}
- Restrições: ${restrictions || 'Nenhuma'}

**REGRAS OBRIGATÓRIAS:**

1. **QUANTIDADES EXATAS:**
   - SEMPRE especifique peso em gramas ou unidades padrão
   - Exemplos corretos:
     * "150g de arroz integral cozido"
     * "120g de peito de frango grelhado"
     * "2 ovos inteiros grandes (100g)"
     * "200ml de leite desnatado"
     * "1 banana média (100g)"
   - NUNCA use termos vagos como "porção", "a gosto", "quantidade média"

2. **CÁLCULO PRECISO DE MACROS:**
   - Use tabelas USDA/TACO para cada alimento
   - Some EXATAMENTE as calorias de cada item
   - Os macros da refeição DEVEM bater com os alimentos listados
   - Margem de erro máxima: ±5%

3. **DISTRIBUIÇÃO INTELIGENTE:**
   - Café da manhã: 25-30% das calorias
   - Almoço: 30-35% das calorias
   - Jantar: 25-30% das calorias
   - Lanches: Restante distribuído

4. **VARIEDADE E PRATICIDADE:**
   - Alimentos reais e acessíveis
   - Preparos simples
   - Respeite preferências e restrições

**FORMATO JSON:**
{
  "name": "Nome criativo para a dieta (ex: 'Plano de Hipertrofia Equilibrado')",
  "description": "Descrição profissional da estratégia nutricional (1-2 frases)",
  "meals": [
    {
      "meal_type": "${langConfig.meals[0]}" (um dos ${meals_per_day} tipos de refeição),
      "meal_name": "Nome descritivo da refeição",
      "foods": "Lista formatada de alimentos, um por linha, com QUANTIDADES EXATAS:\\n- 150g de arroz integral cozido\\n- 120g de peito de frango grelhado\\n- 100g de brócolis cozido\\n- 1 colher de sopa de azeite (10ml)",
      "calories": número_exato,
      "protein": número_decimal,
      "carbs": número_decimal,
      "fat": número_decimal
    }
  ]
}

As ${meals_per_day} refeições DEVEM somar aproximadamente ${profileData.ndc} kcal, ${dailyProtein}g proteína, ${dailyCarbs}g carbs, ${dailyFat}g gordura.

IMPORTANTE: Seja EXTREMAMENTE preciso. Este é um plano profissional que o cliente vai seguir.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um nutricionista certificado especializado em planejamento alimentar preciso e personalizado. Sempre responda com JSON válido. Seja EXTREMAMENTE específico com quantidades e cálculos nutricionais. Todas as respostas em ${langConfig.lang}.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
      temperature: 0.4
    });

    const dietPlan = JSON.parse(response.choices[0].message.content || "{}");

    // Save diet plan to database
    const planResult = await c.env.DB.prepare(
      `INSERT INTO diet_plans (profile_id, name, description, daily_calories, daily_protein, daily_carbs, daily_fat)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
      profile_id,
      dietPlan.name,
      dietPlan.description,
      profileData.ndc,
      dailyProtein,
      dailyCarbs,
      dailyFat
    ).first();

    const planId = (planResult as any).id;

    // Save meals
    let orderIndex = 0;
    for (const meal of dietPlan.meals) {
      // Ensure foods is a string (convert array to newline-separated string if needed)
      const foodsText = Array.isArray(meal.foods) 
        ? meal.foods.join('\n') 
        : typeof meal.foods === 'string' 
          ? meal.foods 
          : JSON.stringify(meal.foods);
      
      await c.env.DB.prepare(
        `INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, foods, calories, protein, carbs, fat, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        planId,
        meal.meal_type,
        meal.meal_name,
        foodsText,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        orderIndex
      ).run();
      orderIndex++;
    }

    return c.json(planResult);
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    if (error?.status === 401) {
      return c.json({ 
        error: "Chave da API OpenAI inválida. Verifique se a chave está configurada corretamente."
      }, 401);
    }
    
    return c.json({ 
      error: error?.message || "Erro ao gerar plano de dieta. Tente novamente."
    }, 500);
  }
});

// Get all user's diet plans
app.get("/api/my-diets", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM diet_plans ORDER BY created_at DESC"
  ).all();

  return c.json(result.results);
});

// Get diet plan by ID
app.get("/api/diet-plan/:id", async (c) => {
  const id = c.req.param("id");

  const plan = await c.env.DB.prepare(
    "SELECT * FROM diet_plans WHERE id = ?"
  ).bind(id).first();

  if (!plan) {
    return c.json({ error: "Diet plan not found" }, 404);
  }

  const meals = await c.env.DB.prepare(
    "SELECT * FROM diet_plan_meals WHERE diet_plan_id = ? ORDER BY order_index"
  ).bind(id).all();

  return c.json({ ...plan, meals: meals.results });
});

// Delete diet plan
app.delete("/api/diet-plan/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM diet_plan_meals WHERE diet_plan_id = ?"
  ).bind(id).run();

  await c.env.DB.prepare(
    "DELETE FROM diet_plans WHERE id = ?"
  ).bind(id).run();

  return c.json({ success: true });
});

// ===== BIOIMPEDANCE API ENDPOINTS =====

// Create bioimpedance record
app.post("/api/bioimpedance", async (c) => {
  const body = await c.req.json();
  const { 
    profile_id, 
    weight_kg, 
    body_fat_percentage, 
    muscle_mass_kg, 
    water_percentage, 
    bone_mass_kg, 
    visceral_fat_level, 
    bmr, 
    metabolic_age 
  } = body;

  const result = await c.env.DB.prepare(
    `INSERT INTO bioimpedance_records 
     (profile_id, weight_kg, body_fat_percentage, muscle_mass_kg, water_percentage, 
      bone_mass_kg, visceral_fat_level, bmr, metabolic_age)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    profile_id, 
    weight_kg, 
    body_fat_percentage, 
    muscle_mass_kg, 
    water_percentage, 
    bone_mass_kg, 
    visceral_fat_level, 
    bmr, 
    metabolic_age
  ).first();

  return c.json(result);
});

// Get all bioimpedance records
app.get("/api/bioimpedance", async (c) => {
  const profileId = c.req.query("profile_id");
  
  let sql = "SELECT * FROM bioimpedance_records WHERE 1=1";
  const params: any[] = [];
  
  if (profileId) {
    sql += " AND profile_id = ?";
    params.push(profileId);
  }
  
  sql += " ORDER BY measured_at DESC";
  
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(result.results);
});

// Get single bioimpedance record
app.get("/api/bioimpedance/:id", async (c) => {
  const id = c.req.param("id");
  
  const result = await c.env.DB.prepare(
    "SELECT * FROM bioimpedance_records WHERE id = ?"
  ).bind(id).first();
  
  if (!result) {
    return c.json({ error: "Record not found" }, 404);
  }
  
  return c.json(result);
});

// Delete bioimpedance record
app.delete("/api/bioimpedance/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM bioimpedance_records WHERE id = ?"
  ).bind(id).run();

  return c.json({ success: true });
});

// Delete workout log exercise
app.delete("/api/workout-log-exercise/:logId/:planExerciseId", async (c) => {
  const logId = c.req.param("logId");
  const planExerciseId = c.req.param("planExerciseId");

  await c.env.DB.prepare(
    "DELETE FROM workout_log_exercises WHERE log_id = ? AND plan_exercise_id = ?"
  ).bind(logId, planExerciseId).run();

  return c.json({ success: true });
});

// ===== DAILY MEAL LOGGING API ENDPOINTS =====

// Create daily meal log
app.post("/api/daily-meal-log", async (c) => {
  const body = await c.req.json();
  const { profile_id, meal_type, meal_name, foods, calories, protein, carbs, fat, image_key, logged_date } = body;

  const result = await c.env.DB.prepare(
    `INSERT INTO daily_meal_logs 
     (profile_id, meal_type, meal_name, foods, calories, protein, carbs, fat, image_key, logged_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(profile_id, meal_type, meal_name, foods, calories, protein, carbs, fat, image_key, logged_date).first();

  return c.json(result);
});

// Get daily meal logs
app.get("/api/daily-meal-logs", async (c) => {
  const date = c.req.query("date");
  const profileId = c.req.query("profile_id");
  
  let sql = "SELECT * FROM daily_meal_logs WHERE 1=1";
  const params: any[] = [];
  
  if (date) {
    sql += " AND logged_date = ?";
    params.push(date);
  }
  
  if (profileId) {
    sql += " AND profile_id = ?";
    params.push(profileId);
  }
  
  sql += " ORDER BY created_at DESC";
  
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(result.results);
});

// Get daily totals
app.get("/api/daily-totals/:date", async (c) => {
  const date = c.req.param("date");
  
  const result = await c.env.DB.prepare(
    `SELECT 
      SUM(calories) as total_calories,
      SUM(protein) as total_protein,
      SUM(carbs) as total_carbs,
      SUM(fat) as total_fat,
      COUNT(*) as meal_count
     FROM daily_meal_logs 
     WHERE logged_date = ?`
  ).bind(date).first();
  
  return c.json(result || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meal_count: 0 });
});

// Delete daily meal log
app.delete("/api/daily-meal-log/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM daily_meal_logs WHERE id = ?"
  ).bind(id).run();

  return c.json({ success: true });
});

// ===== PROGRESS PHOTOS API ENDPOINTS =====

// Create progress photo
app.post("/api/progress-photo", async (c) => {
  const body = await c.req.json();
  const { profile_id, image_key, weight_kg, notes, photo_date } = body;

  const result = await c.env.DB.prepare(
    `INSERT INTO progress_photos (profile_id, image_key, weight_kg, notes, photo_date)
     VALUES (?, ?, ?, ?, ?) RETURNING *`
  ).bind(profile_id, image_key, weight_kg, notes, photo_date).first();

  return c.json(result);
});

// Get all progress photos
app.get("/api/progress-photos", async (c) => {
  const profileId = c.req.query("profile_id");
  
  let sql = "SELECT * FROM progress_photos WHERE 1=1";
  const params: any[] = [];
  
  if (profileId) {
    sql += " AND profile_id = ?";
    params.push(profileId);
  }
  
  sql += " ORDER BY photo_date DESC";
  
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(result.results);
});

// Delete progress photo
app.delete("/api/progress-photo/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM progress_photos WHERE id = ?"
  ).bind(id).run();

  return c.json({ success: true });
});

// ===== PERSONAL RECORDS API ENDPOINTS =====

// Create or update personal record
app.post("/api/personal-record", async (c) => {
  const body = await c.req.json();
  const { exercise_id, profile_id, weight_kg, reps, record_type, achieved_date, notes } = body;

  // Check if record already exists
  const existing = await c.env.DB.prepare(
    `SELECT * FROM personal_records 
     WHERE exercise_id = ? AND profile_id = ? AND record_type = ?`
  ).bind(exercise_id, profile_id, record_type).first();

  if (existing) {
    // Update if new record is better
    const existingData = existing as any;
    const isBetter = record_type === '1RM' 
      ? weight_kg > existingData.weight_kg
      : (weight_kg > existingData.weight_kg || (weight_kg === existingData.weight_kg && reps > existingData.reps));
    
    if (isBetter) {
      const result = await c.env.DB.prepare(
        `UPDATE personal_records 
         SET weight_kg = ?, reps = ?, achieved_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? RETURNING *`
      ).bind(weight_kg, reps, achieved_date, notes, existingData.id).first();
      
      return c.json(result);
    } else {
      return c.json({ message: "Existing record is better", record: existing });
    }
  } else {
    // Create new record
    const result = await c.env.DB.prepare(
      `INSERT INTO personal_records (exercise_id, profile_id, weight_kg, reps, record_type, achieved_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(exercise_id, profile_id, weight_kg, reps, record_type, achieved_date, notes).first();

    return c.json(result);
  }
});

// Get personal records
app.get("/api/personal-records", async (c) => {
  const exerciseId = c.req.query("exercise_id");
  const profileId = c.req.query("profile_id");
  
  let sql = `SELECT pr.*, e.name as exercise_name, e.muscle_group 
             FROM personal_records pr
             JOIN exercises e ON pr.exercise_id = e.id
             WHERE 1=1`;
  const params: any[] = [];
  
  if (exerciseId) {
    sql += " AND pr.exercise_id = ?";
    params.push(exerciseId);
  }
  
  if (profileId) {
    sql += " AND pr.profile_id = ?";
    params.push(profileId);
  }
  
  sql += " ORDER BY pr.achieved_date DESC";
  
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(result.results);
});

// Get top PRs for profile
app.get("/api/top-personal-records/:profileId", async (c) => {
  const profileId = c.req.param("profileId");
  
  const result = await c.env.DB.prepare(
    `SELECT pr.*, e.name as exercise_name, e.muscle_group 
     FROM personal_records pr
     JOIN exercises e ON pr.exercise_id = e.id
     WHERE pr.profile_id = ?
     ORDER BY pr.weight_kg DESC
     LIMIT 10`
  ).bind(profileId).all();
  
  return c.json(result.results);
});

// Delete personal record
app.delete("/api/personal-record/:id", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM personal_records WHERE id = ?"
  ).bind(id).run();

  return c.json({ success: true });
});

// ===== DASHBOARD AND STATS API ENDPOINTS =====

// Get workout statistics for dashboard
app.get("/api/workout-stats", async (c) => {
  try {
    // Get all workout logs with exercise data
    const logs = await c.env.DB.prepare(
      `SELECT wl.*, wle.weight_kg, wle.reps_completed, wpe.sets, wpe.exercise_id, e.name as exercise_name
       FROM workout_logs wl
       LEFT JOIN workout_log_exercises wle ON wl.id = wle.log_id
       LEFT JOIN workout_plan_exercises wpe ON wle.plan_exercise_id = wpe.id
       LEFT JOIN exercises e ON wpe.exercise_id = e.id
       ORDER BY wl.completed_at DESC`
    ).all();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Calculate stats
    let totalWorkouts = 0;
    let currentWeek = 0;
    let lastWeek = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    let weightCount = 0;

    const logIds = new Set();
    const exerciseProgressMap: Record<string, Array<{ date: string; weight: number }>> = {};

    for (const log of logs.results) {
      const logData = log as any;
      const logDate = new Date(logData.completed_at);
      
      // Count unique workouts
      if (!logIds.has(logData.id)) {
        logIds.add(logData.id);
        totalWorkouts++;
        
        if (logDate >= weekAgo) {
          currentWeek++;
        } else if (logDate >= twoWeeksAgo) {
          lastWeek++;
        }
      }

      // Calculate weight stats
      if (logData.weight_kg) {
        totalWeight += logData.weight_kg;
        weightCount++;
        
        // Calculate volume (weight * sets * reps)
        const reps = logData.reps_completed ? parseInt(logData.reps_completed.split(',')[0]) : 10;
        totalVolume += logData.weight_kg * (logData.sets || 3) * reps;

        // Track exercise progress
        if (logData.exercise_name) {
          if (!exerciseProgressMap[logData.exercise_name]) {
            exerciseProgressMap[logData.exercise_name] = [];
          }
          exerciseProgressMap[logData.exercise_name].push({
            date: logDate.toISOString().split('T')[0],
            weight: logData.weight_kg
          });
        }
      }
    }

    // Convert exercise progress map to array and limit to top 10 exercises
    const exerciseProgress = Object.entries(exerciseProgressMap)
      .map(([exercise_name, data]) => ({
        exercise_name,
        data: data.slice(-10) // Last 10 logs per exercise
      }))
      .slice(0, 10); // Top 10 exercises

    const stats = {
      totalWorkouts,
      currentWeek,
      lastWeek,
      averageWeight: weightCount > 0 ? totalWeight / weightCount : 0,
      totalVolume
    };

    return c.json({ stats, exerciseProgress });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Get all workout logs across all plans
app.get("/api/all-workout-logs", async (c) => {
  try {
    const logs = await c.env.DB.prepare(
      `SELECT wl.*, 
       (SELECT COUNT(*) FROM workout_log_exercises WHERE log_id = wl.id) as exercise_count
       FROM workout_logs wl
       ORDER BY wl.completed_at DESC`
    ).all();

    return c.json(logs.results);
  } catch (error) {
    console.error('Error fetching all workout logs:', error);
    return c.json({ error: 'Failed to fetch logs' }, 500);
  }
});

// Get nutrition statistics for dashboard
app.get("/api/nutrition-stats", async (c) => {
  try {
    // Get all meal logs
    const logs = await c.env.DB.prepare(
      `SELECT * FROM daily_meal_logs ORDER BY logged_date DESC`
    ).all();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalMeals = 0;
    let currentWeek = 0;

    const dailyDataMap: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};

    for (const log of logs.results) {
      const logData = log as any;
      const logDate = new Date(logData.logged_date);
      
      totalMeals++;
      totalCalories += logData.calories || 0;
      totalProtein += logData.protein || 0;
      totalCarbs += logData.carbs || 0;
      totalFat += logData.fat || 0;

      if (logDate >= weekAgo) {
        currentWeek++;
      }

      // Build daily data for last 30 days
      if (logDate >= thirtyDaysAgo) {
        const dateStr = logData.logged_date;
        if (!dailyDataMap[dateStr]) {
          dailyDataMap[dateStr] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        dailyDataMap[dateStr].calories += logData.calories || 0;
        dailyDataMap[dateStr].protein += logData.protein || 0;
        dailyDataMap[dateStr].carbs += logData.carbs || 0;
        dailyDataMap[dateStr].fat += logData.fat || 0;
      }
    }

    const dailyData = Object.entries(dailyDataMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const stats = {
      averageCalories: totalMeals > 0 ? totalCalories / totalMeals : 0,
      averageProtein: totalMeals > 0 ? totalProtein / totalMeals : 0,
      averageCarbs: totalMeals > 0 ? totalCarbs / totalMeals : 0,
      averageFat: totalMeals > 0 ? totalFat / totalMeals : 0,
      totalMeals,
      currentWeek,
      waterIntake: 0
    };

    return c.json({ stats, dailyData });
  } catch (error) {
    console.error('Error fetching nutrition stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Log water intake
app.post("/api/water-log", async (c) => {
  const body = await c.req.json();
  const { user_id, amount_ml, logged_date } = body;

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO water_logs (user_id, amount_ml, logged_date)
       VALUES (?, ?, ?) RETURNING *`
    ).bind(user_id, amount_ml, logged_date).first();

    return c.json(result);
  } catch (error) {
    console.error('Error logging water:', error);
    return c.json({ error: 'Failed to log water' }, 500);
  }
});

// Get water logs for a date
app.get("/api/water-logs/:date", async (c) => {
  const date = c.req.param("date");
  
  try {
    const result = await c.env.DB.prepare(
      `SELECT SUM(amount_ml) as total_ml FROM water_logs WHERE logged_date = ?`
    ).bind(date).first();

    return c.json({ total_ml: (result as any)?.total_ml || 0 });
  } catch (error) {
    console.error('Error fetching water logs:', error);
    return c.json({ error: 'Failed to fetch water logs' }, 500);
  }
});

// ===== PROFILE API ENDPOINTS =====

// Get or create user profile
app.get("/api/profile", async (c) => {
  try {
    // For now, use a default user_id. In production, this would come from auth
    const userId = 'default_user';
    
    let profile = await c.env.DB.prepare(
      "SELECT * FROM user_profiles WHERE user_id = ?"
    ).bind(userId).first();

    if (!profile) {
      // Create default profile
      profile = await c.env.DB.prepare(
        `INSERT INTO user_profiles (user_id, display_name, onboarding_completed, theme)
         VALUES (?, ?, ?, ?) RETURNING *`
      ).bind(userId, 'Usuário', 0, 'dark').first();
    }

    return c.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put("/api/profile", async (c) => {
  const body = await c.req.json();
  const { display_name, bio, height_cm, weight_kg, birth_date, gender, photo_url } = body;
  const userId = 'default_user';

  try {
    const result = await c.env.DB.prepare(
      `UPDATE user_profiles 
       SET display_name = ?, bio = ?, photo_url = ?, height_cm = ?, weight_kg = ?, birth_date = ?, gender = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? RETURNING *`
    ).bind(display_name, bio, photo_url, height_cm, weight_kg, birth_date, gender, userId).first();

    return c.json(result);
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Update theme
app.put("/api/profile/theme", async (c) => {
  const body = await c.req.json();
  const { theme } = body;
  const userId = 'default_user';

  try {
    const result = await c.env.DB.prepare(
      `UPDATE user_profiles SET theme = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? RETURNING *`
    ).bind(theme, userId).first();

    return c.json(result);
  } catch (error) {
    console.error('Error updating theme:', error);
    return c.json({ error: 'Failed to update theme' }, 500);
  }
});

// Get profile stats
app.get("/api/profile/stats", async (c) => {
  const userId = 'default_user';

  try {
    // Get workout count
    const workoutCount = await c.env.DB.prepare(
      `SELECT COUNT(DISTINCT id) as count FROM workout_logs`
    ).first();

    // Get meal count
    const mealCount = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM daily_meal_logs`
    ).first();

    // Get achievements count
    const achievementCount = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?`
    ).bind(userId).first();

    // Get total points
    const pointsResult = await c.env.DB.prepare(
      `SELECT SUM(a.points) as total 
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = ?`
    ).bind(userId).first();

    // Calculate current streak (simplified - just count recent days)
    const recentLogs = await c.env.DB.prepare(
      `SELECT DISTINCT logged_date FROM daily_meal_logs
       WHERE logged_date >= date('now', '-7 days')
       ORDER BY logged_date DESC`
    ).all();

    const stats = {
      workouts_completed: (workoutCount as any)?.count || 0,
      meals_logged: (mealCount as any)?.count || 0,
      achievements_unlocked: (achievementCount as any)?.count || 0,
      current_streak: recentLogs.results.length || 0,
      total_points: (pointsResult as any)?.total || 0
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// ===== ACHIEVEMENTS API ENDPOINTS =====

// Get all achievements with unlock status
app.get("/api/achievements", async (c) => {
  const userId = 'default_user';

  try {
    const achievements = await c.env.DB.prepare(
      `SELECT a.*, 
        CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as unlocked,
        ua.unlocked_at
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
       ORDER BY a.category, a.points`
    ).bind(userId).all();

    // Calculate total points
    const pointsResult = await c.env.DB.prepare(
      `SELECT SUM(a.points) as total 
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = ?`
    ).bind(userId).first();

    return c.json({
      achievements: achievements.results,
      total_points: (pointsResult as any)?.total || 0
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return c.json({ error: 'Failed to fetch achievements' }, 500);
  }
});

// ===== WORKOUT CALENDAR API ENDPOINTS =====

// Create workout calendar entry
app.post("/api/workout-calendar", async (c) => {
  const body = await c.req.json();
  const { workout_date, sport_category, notes } = body;
  const userId = 'default_user';

  try {
    // Check if entry already exists for this date
    const existing = await c.env.DB.prepare(
      `SELECT id FROM workout_calendar WHERE user_id = ? AND workout_date = ?`
    ).bind(userId, workout_date).first();

    if (existing) {
      // Update existing entry
      const result = await c.env.DB.prepare(
        `UPDATE workout_calendar 
         SET sport_category = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? RETURNING *`
      ).bind(sport_category, notes, (existing as any).id).first();
      return c.json(result);
    } else {
      // Create new entry
      const result = await c.env.DB.prepare(
        `INSERT INTO workout_calendar (user_id, workout_date, sport_category, notes)
         VALUES (?, ?, ?, ?) RETURNING *`
      ).bind(userId, workout_date, sport_category, notes).first();
      return c.json(result);
    }
  } catch (error) {
    console.error('Error saving workout calendar:', error);
    return c.json({ error: 'Failed to save workout' }, 500);
  }
});

// Get workout calendar entries
app.get("/api/workout-calendar", async (c) => {
  const userId = 'default_user';
  const startDate = c.req.query("start_date");
  const endDate = c.req.query("end_date");

  try {
    let sql = `SELECT * FROM workout_calendar WHERE user_id = ?`;
    const params: any[] = [userId];

    if (startDate && endDate) {
      sql += ` AND workout_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    sql += ` ORDER BY workout_date DESC`;

    const result = await c.env.DB.prepare(sql).bind(...params).all();
    return c.json(result.results);
  } catch (error) {
    console.error('Error fetching workout calendar:', error);
    return c.json({ error: 'Failed to fetch calendar' }, 500);
  }
});

// Delete workout calendar entry
app.delete("/api/workout-calendar/:date", async (c) => {
  const date = c.req.param("date");
  const userId = 'default_user';

  try {
    await c.env.DB.prepare(
      `DELETE FROM workout_calendar WHERE user_id = ? AND workout_date = ?`
    ).bind(userId, date).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout calendar:', error);
    return c.json({ error: 'Failed to delete workout' }, 500);
  }
});

// Check and unlock achievements (called automatically after actions)
app.post("/api/check-achievements", async (c) => {
  const userId = 'default_user';

  try {
    // Get all achievements
    const achievements = await c.env.DB.prepare(
      `SELECT * FROM achievements`
    ).all();

    const newUnlocks = [];

    for (const achievement of achievements.results) {
      const achData = achievement as any;
      
      // Check if already unlocked
      const existing = await c.env.DB.prepare(
        `SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?`
      ).bind(userId, achData.id).first();

      if (existing) continue;

      // Check if requirements are met
      let shouldUnlock = false;

      if (achData.requirement_type === 'workouts_completed') {
        const count = await c.env.DB.prepare(
          `SELECT COUNT(DISTINCT id) as count FROM workout_logs`
        ).first();
        shouldUnlock = ((count as any)?.count || 0) >= achData.requirement_value;
      } else if (achData.requirement_type === 'meals_logged') {
        const count = await c.env.DB.prepare(
          `SELECT COUNT(*) as count FROM daily_meal_logs`
        ).first();
        shouldUnlock = ((count as any)?.count || 0) >= achData.requirement_value;
      } else if (achData.requirement_type === 'photos_taken') {
        const count = await c.env.DB.prepare(
          `SELECT COUNT(*) as count FROM progress_photos`
        ).first();
        shouldUnlock = ((count as any)?.count || 0) >= achData.requirement_value;
      } else if (achData.requirement_type === 'prs_set') {
        const count = await c.env.DB.prepare(
          `SELECT COUNT(*) as count FROM personal_records`
        ).first();
        shouldUnlock = ((count as any)?.count || 0) >= achData.requirement_value;
      }

      if (shouldUnlock) {
        await c.env.DB.prepare(
          `INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`
        ).bind(userId, achData.id).run();
        newUnlocks.push(achData);
      }
    }

    return c.json({ newUnlocks });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return c.json({ error: 'Failed to check achievements' }, 500);
  }
});

export default app;
