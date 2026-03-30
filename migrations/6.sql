
CREATE TABLE food_database (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_food_database_category ON food_database(category);
CREATE INDEX idx_food_database_name ON food_database(name);

INSERT INTO food_database (name, category, serving_size, calories, protein, carbs, fat, fiber) VALUES
-- Proteínas
('Peito de Frango Grelhado', 'Proteínas', '100g', 165, 31, 0, 3.6, 0),
('Carne Bovina Magra', 'Proteínas', '100g', 250, 26, 0, 15, 0),
('Salmão', 'Proteínas', '100g', 208, 20, 0, 13, 0),
('Atum em Lata', 'Proteínas', '100g', 116, 26, 0, 1, 0),
('Ovo Cozido', 'Proteínas', '1 unidade', 78, 6, 0.6, 5, 0),
('Tilápia', 'Proteínas', '100g', 96, 20, 0, 1.7, 0),
('Peito de Peru', 'Proteínas', '100g', 135, 30, 0, 1.5, 0),
('Camarão', 'Proteínas', '100g', 99, 24, 0.2, 0.3, 0),
('Queijo Cottage', 'Proteínas', '100g', 98, 11, 3.4, 4.3, 0),
('Whey Protein', 'Proteínas', '30g (1 scoop)', 120, 24, 3, 1.5, 0),

-- Carboidratos
('Arroz Branco Cozido', 'Carboidratos', '100g', 130, 2.7, 28, 0.3, 0.4),
('Arroz Integral Cozido', 'Carboidratos', '100g', 111, 2.6, 23, 0.9, 1.8),
('Batata Doce Cozida', 'Carboidratos', '100g', 86, 1.6, 20, 0.1, 3),
('Macarrão Integral Cozido', 'Carboidratos', '100g', 124, 5, 26, 0.5, 3.5),
('Pão Integral', 'Carboidratos', '1 fatia (25g)', 69, 3.6, 11.6, 1.2, 2),
('Aveia', 'Carboidratos', '100g', 389, 16.9, 66.3, 6.9, 10.6),
('Tapioca', 'Carboidratos', '100g', 358, 0.2, 88.7, 0.02, 0.9),
('Batata Inglesa Cozida', 'Carboidratos', '100g', 77, 2, 17, 0.1, 2.2),
('Mandioca Cozida', 'Carboidratos', '100g', 125, 0.6, 30, 0.3, 1.6),
('Quinoa Cozida', 'Carboidratos', '100g', 120, 4.4, 21.3, 1.9, 2.8),

-- Vegetais
('Brócolis Cozido', 'Vegetais', '100g', 35, 2.4, 7, 0.4, 3.3),
('Couve', 'Vegetais', '100g', 33, 2.9, 5.4, 0.7, 2),
('Espinafre', 'Vegetais', '100g', 23, 2.9, 3.6, 0.4, 2.2),
('Alface', 'Vegetais', '100g', 15, 1.4, 2.9, 0.2, 1.3),
('Tomate', 'Vegetais', '100g', 18, 0.9, 3.9, 0.2, 1.2),
('Cenoura', 'Vegetais', '100g', 41, 0.9, 10, 0.2, 2.8),
('Pepino', 'Vegetais', '100g', 15, 0.7, 3.6, 0.1, 0.5),
('Abobrinha', 'Vegetais', '100g', 17, 1.2, 3.1, 0.3, 1),
('Couve-flor', 'Vegetais', '100g', 25, 1.9, 5, 0.3, 2),
('Berinjela', 'Vegetais', '100g', 25, 1, 6, 0.2, 3),

-- Frutas
('Banana', 'Frutas', '1 unidade (100g)', 89, 1.1, 23, 0.3, 2.6),
('Maçã', 'Frutas', '1 unidade (182g)', 95, 0.5, 25, 0.3, 4.4),
('Morango', 'Frutas', '100g', 32, 0.7, 7.7, 0.3, 2),
('Abacate', 'Frutas', '100g', 160, 2, 8.5, 14.7, 6.7),
('Mamão', 'Frutas', '100g', 43, 0.5, 11, 0.3, 1.7),
('Laranja', 'Frutas', '1 unidade (131g)', 62, 1.2, 15.4, 0.2, 3.1),
('Melancia', 'Frutas', '100g', 30, 0.6, 7.6, 0.2, 0.4),
('Uva', 'Frutas', '100g', 69, 0.7, 18.1, 0.2, 0.9),
('Abacaxi', 'Frutas', '100g', 50, 0.5, 13.1, 0.1, 1.4),
('Kiwi', 'Frutas', '1 unidade (69g)', 42, 0.8, 10.1, 0.4, 2.1),

-- Gorduras Saudáveis
('Azeite de Oliva', 'Gorduras', '1 colher sopa (13g)', 119, 0, 0, 13.5, 0),
('Amendoim', 'Gorduras', '100g', 567, 25.8, 16.1, 49.2, 8.5),
('Castanha de Caju', 'Gorduras', '100g', 553, 18.2, 30.2, 43.8, 3.3),
('Amêndoas', 'Gorduras', '100g', 579, 21.2, 21.6, 49.9, 12.5),
('Pasta de Amendoim', 'Gorduras', '1 colher sopa (16g)', 94, 3.8, 3.5, 8, 0.9),
('Óleo de Coco', 'Gorduras', '1 colher sopa (13g)', 117, 0, 0, 13.5, 0),
('Nozes', 'Gorduras', '100g', 654, 15.2, 13.7, 65.2, 6.7),
('Linhaça', 'Gorduras', '100g', 534, 18.3, 28.9, 42.2, 27.3),
('Chia', 'Gorduras', '100g', 486, 16.5, 42.1, 30.7, 34.4),
('Abacate', 'Gorduras', '100g', 160, 2, 8.5, 14.7, 6.7),

-- Laticínios
('Leite Desnatado', 'Laticínios', '100ml', 35, 3.4, 5, 0.1, 0),
('Leite Integral', 'Laticínios', '100ml', 61, 3.2, 4.8, 3.3, 0),
('Iogurte Natural', 'Laticínios', '100g', 61, 3.5, 4.7, 3.3, 0),
('Iogurte Grego', 'Laticínios', '100g', 97, 9, 3.6, 5, 0),
('Queijo Minas', 'Laticínios', '100g', 264, 17.4, 3, 20.8, 0),
('Queijo Muçarela', 'Laticínios', '100g', 280, 18.9, 3.1, 22, 0),
('Requeijão Light', 'Laticínios', '100g', 136, 8, 4, 9.6, 0),

-- Leguminosas
('Feijão Preto Cozido', 'Leguminosas', '100g', 77, 4.5, 14, 0.5, 4.8),
('Feijão Carioca Cozido', 'Leguminosas', '100g', 76, 4.8, 13.6, 0.5, 6.5),
('Lentilha Cozida', 'Leguminosas', '100g', 116, 9, 20, 0.4, 7.9),
('Grão de Bico Cozido', 'Leguminosas', '100g', 164, 8.9, 27.4, 2.6, 7.6),
('Ervilha Cozida', 'Leguminosas', '100g', 81, 5.4, 14.5, 0.4, 5.7),

-- Snacks Saudáveis
('Barra de Proteína', 'Snacks', '1 unidade (60g)', 200, 20, 20, 5, 3),
('Pipoca sem Óleo', 'Snacks', '100g', 387, 13, 78, 4.5, 15),
('Chips de Batata Doce', 'Snacks', '100g', 340, 2, 60, 10, 6),
('Mix de Nuts', 'Snacks', '30g', 180, 5, 6, 16, 2);
