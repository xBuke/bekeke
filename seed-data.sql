-- Gradovi
INSERT INTO cities (name, slug) VALUES
('Split', 'split'),
('Zagreb', 'zagreb'),
('Rijeka', 'rijeka'),
('Osijek', 'osijek'),
('Dubrovnik', 'dubrovnik');

-- Kategorije
INSERT INTO categories (name, slug, description, icon) VALUES
('Vodoinstalater', 'vodoinstalater', 'Popravak vodovodnih instalacija, slavina, WC-a', '🚰'),
('Električar', 'elektricar', 'Električne instalacije, popravci, ugradnja', '⚡'),
('Bravar', 'bravar', 'Otvaranje vrata, brave, metalni radovi', '🔐'),
('Keramičar', 'keramicar', 'Postavljanje pločica, keramike, sanacije', '🧱'),
('Soboslikar', 'soboslikar', 'Bojanje zidova, fasada, dekorativne tehnike', '🎨'),
('Čistačica', 'cisticica', 'Čišćenje stanova, kuća, ureda', '🧹'),
('Dadilja', 'dadilja', 'Čuvanje djece, pomoć s domaćim zadacima', '👶'),
('Instruktor', 'instruktor', 'Privatne instrukcije iz različitih predmeta', '📚'),
('IT stručnjak', 'it-strucnjak', 'Računala, mreže, održavanje', '💻'),
('Frizer', 'frizer', 'Šišanje, frizure, styling', '💇');
