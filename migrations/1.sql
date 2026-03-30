
CREATE TABLE exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  difficulty TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);

INSERT INTO exercises (name, description, instructions, muscle_group, equipment, difficulty, image_url) VALUES
('Supino Reto', 'Exercício fundamental para desenvolvimento do peitoral', 'Deite-se no banco com os pés firmes no chão. Segure a barra com as mãos um pouco mais largas que os ombros. Abaixe a barra controladamente até o peito e empurre para cima até estender os braços completamente.', 'Peito', 'Barra e Banco', 'Iniciante', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'),
('Agachamento Livre', 'Exercício completo para pernas e glúteos', 'Fique em pé com os pés na largura dos ombros. Mantenha o peito elevado e desça flexionando quadris e joelhos até as coxas ficarem paralelas ao chão. Retorne à posição inicial empurrando pelos calcanhares.', 'Pernas', 'Barra', 'Iniciante', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800'),
('Rosca Direta', 'Exercício isolado para bíceps', 'Fique em pé com os pés na largura dos ombros. Segure a barra com as palmas viradas para cima. Mantendo os cotovelos fixos ao lado do corpo, flexione os braços levantando a barra até o peito. Abaixe controladamente.', 'Bíceps', 'Barra', 'Iniciante', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('Desenvolvimento com Halteres', 'Exercício para ombros completos', 'Sentado em um banco com apoio, segure um halter em cada mão na altura dos ombros. Empurre os halteres para cima até estender completamente os braços. Abaixe controladamente até a posição inicial.', 'Ombros', 'Halteres e Banco', 'Iniciante', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800'),
('Remada Curvada', 'Exercício fundamental para costas', 'Incline o tronco para frente mantendo as costas retas. Segure a barra com as mãos na largura dos ombros. Puxe a barra em direção ao abdômen, contraindo as costas. Abaixe controladamente.', 'Costas', 'Barra', 'Intermediário', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'),
('Tríceps Pulley', 'Exercício isolado para tríceps', 'Fique de frente para o pulley com as mãos segurando a barra. Mantenha os cotovelos fixos ao lado do corpo e estenda os braços empurrando a barra para baixo. Retorne controladamente.', 'Tríceps', 'Pulley', 'Iniciante', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'),
('Abdominal Crunch', 'Exercício básico para abdômen', 'Deite-se de costas com os joelhos flexionados. Coloque as mãos atrás da cabeça. Levante o tronco contraindo o abdômen, mantendo a lombar no chão. Abaixe controladamente.', 'Abdômen', 'Sem equipamento', 'Iniciante', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('Levantamento Terra', 'Exercício composto para corpo inteiro', 'Fique em pé com a barra no chão próxima às canelas. Agache e segure a barra. Mantenha as costas retas e levante a barra estendendo quadris e joelhos simultaneamente. Abaixe controladamente.', 'Costas', 'Barra', 'Avançado', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800'),
('Leg Press', 'Exercício para pernas em máquina', 'Sente-se na máquina com os pés na plataforma na largura dos ombros. Empurre a plataforma estendendo as pernas, sem travar os joelhos. Abaixe controladamente até formar um ângulo de 90 graus.', 'Pernas', 'Leg Press', 'Iniciante', 'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=800'),
('Crucifixo com Halteres', 'Exercício isolado para peitoral', 'Deite-se em um banco segurando halteres acima do peito. Com os cotovelos levemente flexionados, abra os braços para os lados até sentir alongamento no peito. Retorne à posição inicial.', 'Peito', 'Halteres e Banco', 'Iniciante', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'),
('Elevação Lateral', 'Exercício isolado para ombros', 'Fique em pé com um halter em cada mão ao lado do corpo. Mantenha os cotovelos levemente flexionados e levante os braços lateralmente até a altura dos ombros. Abaixe controladamente.', 'Ombros', 'Halteres', 'Iniciante', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'),
('Stiff', 'Exercício para posterior de coxa', 'Fique em pé com os joelhos levemente flexionados segurando a barra. Incline o tronco para frente mantendo as costas retas até sentir alongamento na parte posterior das coxas. Retorne à posição inicial.', 'Pernas', 'Barra', 'Intermediário', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800');
