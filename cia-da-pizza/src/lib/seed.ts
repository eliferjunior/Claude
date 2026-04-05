import type Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

// Tuple: [name, description, priceSmall, priceMedium, priceLarge, imageUrl]
type P = [string, string, number | null, number | null, number | null, string | null];

const IMG = {
  mussarela:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/64ae1862f-f96b-49ff-af9d-369c100522912483.png',
  calabresa:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/04ae1862f-f96b-49ff-af9d-369c100522911783.png',
  quatro_queijos:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/24ae1862f-f96b-49ff-af9d-369c100522917801.png',
  margherita:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/34ae1862f-f96b-49ff-af9d-369c100522912369.png',
  pepperoni:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/14ae1862f-f96b-49ff-af9d-369c100522916445.png',
  portuguesa:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/04ae1862f-f96b-49ff-af9d-369c100522911783.png',
  frango_requeijao:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/24ae1862f-f96b-49ff-af9d-369c100522917801.png',
  bacon:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/04ae1862f-f96b-49ff-af9d-369c100522911783.png',
  chocolate_morango:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/24ae1862f-f96b-49ff-af9d-369c100522917801.png',
  chocolate_mms:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/34ae1862f-f96b-49ff-af9d-369c100522918978.png',
  chocolate_branco:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/14ae1862f-f96b-49ff-af9d-369c100522916062.png',
  doce_tradicional:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/44ae1862f-f96b-49ff-af9d-369c100522913868.png',
  brigadeiro:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/24ae1862f-f96b-49ff-af9d-369c100522917801.png',
  beirute:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/04ae1862f-f96b-49ff-af9d-369c100522919199.png',
  pastel:
    'https://image.qwenlm.ai/public_source/48b094f8-ab24-4e89-ac8c-c5dee8c6304f/34ae1862f-f96b-49ff-af9d-369c100522916777.png',
};

export function seedDatabase(db: Database.Database): void {
  console.log('Seeding database with initial data...');

  const seed = db.transaction(() => {
    // --- Admin user ---
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare(
      'INSERT INTO admin_users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
    ).run('admin', passwordHash, 'Administrador', 'super_admin');

    // --- Stores ---
    const storePasswordHash = bcrypt.hashSync('loja123', 10);

    const insertStore = db.prepare(`
      INSERT INTO stores (name, address, phone, whatsapp, opening_hours, closing_hours, active, is_delivery, login_username, login_password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStore.run(
      'Loja 1 - Hélio Palermo',
      'Av. Dr. Hélio Palermo, 2811, Franca/SP',
      '(16) 3711-1111',
      '5516937111111',
      '18:00',
      '23:00',
      1,
      0,
      'loja1',
      storePasswordHash,
    );
    insertStore.run(
      'Loja 2 - Parque Progresso',
      'Franca/SP',
      '(16) 3711-2222',
      '5516937112222',
      '18:00',
      '23:00',
      1,
      0,
      'loja2',
      storePasswordHash,
    );
    insertStore.run(
      'Loja 4 - Delivery',
      'Av. Adhemar Pereira de Barros, 1474, Franca/SP',
      '(16) 3711-4444',
      '5516937114444',
      '18:00',
      '23:30',
      1,
      1,
      'loja4',
      storePasswordHash,
    );
    insertStore.run(
      'Loja 6 - Pulicano',
      'Franca/SP',
      '(16) 3711-6666',
      '5516937116666',
      '18:00',
      '23:00',
      1,
      0,
      'loja6',
      storePasswordHash,
    );

    // --- Settings ---
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('whatsapp_enabled', '1');
    insertSetting.run('whatsapp_number', '16999999999');
    insertSetting.run(
      'whatsapp_default_message',
      'Olá! Gostaria de fazer um pedido na Cia da Pizza!',
    );
    insertSetting.run('company_name', 'Cia da Pizza');
    insertSetting.run('company_logo_url', '');
    insertSetting.run('company_instagram', 'https://www.instagram.com/pizzacompanhiada');
    insertSetting.run('company_facebook', 'https://www.facebook.com/ciadapizz');
    insertSetting.run('primary_color', '#DC2626');
    insertSetting.run('secondary_color', '#EAB308');
    insertSetting.run('delivery_fee', '10.00');

    // --- Categories ---
    const insertCategory = db.prepare(
      'INSERT INTO categories (name, order_position, active) VALUES (?, ?, 1)',
    );

    const categories: { name: string; order: number }[] = [
      { name: 'Pizzas Tradicionais', order: 1 },
      { name: 'Pizzas Especiais', order: 2 },
      { name: 'Pizzas Premium', order: 3 },
      { name: 'Pizzas Doces', order: 4 },
      { name: 'Pastéis', order: 5 },
      { name: 'Beirutes', order: 6 },
      { name: 'Porções', order: 7 },
      { name: 'Refrigerantes', order: 8 },
      { name: 'Águas e Sucos', order: 9 },
      { name: 'Cervejas e Drinks', order: 10 },
      { name: 'Outros', order: 11 },
    ];

    const categoryIds: Record<string, number> = {};
    for (const cat of categories) {
      const result = insertCategory.run(cat.name, cat.order);
      categoryIds[cat.name] = Number(result.lastInsertRowid);
    }

    // --- Products ---
    const insertProduct = db.prepare(`
      INSERT INTO products (category_id, name, description, price_small, price_medium, price_large, image_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const addProducts = (categoryName: string, items: P[]) => {
      const catId = categoryIds[categoryName];
      for (const [name, desc, ps, pm, pl, img] of items) {
        insertProduct.run(catId, name, desc, ps, pm, pl, img);
      }
    };

    // --- Pizzas Tradicionais ---
    addProducts('Pizzas Tradicionais', [
      ['Mussarela', 'Muçarela fatiada, orégano, azeitonas pretas', 42, 52, 66.3, IMG.mussarela],
      ['Napolitana', 'Muçarela, tomate fresco gratinado, orégano, parmesão', 47, 57, 71, null],
      [
        'Margherita',
        'Muçarela, tomate fresco, manjericão fresco, orégano',
        45,
        55,
        69.4,
        IMG.margherita,
      ],
      [
        'Portuguesa',
        'Presunto, ovo cozido, cebola, muçarela, azeitonas',
        48,
        58,
        72.7,
        IMG.portuguesa,
      ],
      [
        'Calabresa',
        'Calabresa defumada fatiada, cebola, azeitonas, orégano',
        41,
        51,
        64.6,
        IMG.calabresa,
      ],
      ['Toscana', 'Muçarela, calabresa moída temperada, cebolinha, parmesão', 45, 55, 69.4, null],
      [
        'Baiana',
        'Calabresa moída, ovo cozido, pimenta biquinho, azeitonas, cebola',
        45,
        55,
        69.4,
        null,
      ],
      ['Atum', 'Atum sólido, cebola, azeitonas pretas', 45, 55, 69.5, null],
      ['Bacon', 'Muçarela, bacon crocante em cubos, azeitonas, orégano', 45, 55, 69.5, IMG.bacon],
      [
        'Alho e Óleo',
        'Muçarela, alho frito laminado, azeitonas, azeite, orégano',
        44,
        54,
        67.7,
        null,
      ],
    ]);

    // --- Pizzas Especiais ---
    addProducts('Pizzas Especiais', [
      [
        'Margherita Especial',
        'Muçarela de búfala, tomate seco, manjericão, azeite extra virgem',
        49,
        59,
        73.5,
        IMG.margherita,
      ],
      [
        'Quatro Queijos',
        'Muçarela, requeijão, gorgonzola, parmesão',
        51,
        61,
        76.6,
        IMG.quatro_queijos,
      ],
      ['Cinco Queijos', 'Muçarela, provolone, gorgonzola, parmesão, requeijão', 53, 63, 78.4, null],
      ['Bersaglieri', 'Muçarela, aliche, alcaparras, azeitonas, parmesão', 48, 58, 72.7, null],
      [
        'Provoleta',
        'Provolone fatiado, anchova, alcaparras, azeitonas, orégano',
        51,
        61,
        76.8,
        null,
      ],
      ['Gorgonzola', 'Cebola dourada refogada, gorgonzola cremoso, azeitonas', 48, 58, 72.7, null],
      ['Salerno', 'Presunto, gorgonzola, parmesão, tomate fresco, azeitonas', 51, 61, 76.6, null],
      ['Conceta', 'Calabresa moída, requeijão cremoso, azeitonas, orégano', 46, 56, 70.8, null],
      ['Macerata', 'Muçarela, copa italiana, cebola, azeitonas', 47, 57, 71.4, null],
      ['Atum Especial', 'Atum sólido, milho verde, azeitonas, orégano', 48, 58, 73.3, null],
      ['Peruana', 'Atum, ovo cozido, cebola, muçarela, azeitonas', 51, 61, 76.8, null],
      ['Aliche', 'Aliche (anchova), cebola, parmesão, azeitonas', 51, 61, 76.8, null],
      ['Romana', 'Muçarela, aliche, tomate fresco, azeitonas pretas', 51, 61, 77.2, null],
      [
        'Frango c/ Requeijão',
        'Frango desfiado, requeijão Scala, azeitonas, orégano',
        48,
        58,
        73.2,
        IMG.frango_requeijao,
      ],
      ['Escarola I', 'Escarola refogada, bacon, muçarela, azeitonas, alho', 44, 54, 67.7, null],
      ['Escarola II', 'Escarola refogada, bacon, aliche, muçarela, azeitonas', 48, 58, 73.2, null],
      ['Siciliana', 'Cogumelos champignon, bacon, muçarela, azeitonas', 45, 55, 69.5, null],
      ['Alcachofra', 'Muçarela, coração de alcachofra, parmesão, azeite', 51, 61, 76.7, null],
      ['Palmito', 'Palmito pupunha, cebola, muçarela, parmesão, azeitonas', 51, 61, 76.7, null],
      [
        'Rúcula',
        'Rúcula fresca, tomate seco, muçarela de búfala, parmesão, azeite balsâmico',
        48,
        58,
        73.2,
        null,
      ],
      ['Verano', 'Palmito, milho verde, alcaparras, requeijão, azeitonas', 51, 61, 76.7, null],
      ['Requeijão Scala', 'Requeijão cremoso Scala, azeitonas, orégano', 48, 58, 73.2, null],
      ['Brócolis', 'Brócolis refogado alho, bacon, muçarela, azeitonas', 45, 55, 69.5, null],
      ['Lombo Canadense', 'Lombo canadense, cebola, queijo cremoso, azeitonas', 48, 58, 73.2, null],
      ['Peito de Peru', 'Peito de peru, cebola, requeijão, azeitonas', 48, 58, 73.2, null],
      [
        'Abobrinha',
        'Abobrinha italiana grelhada, muçarela, alho frito, parmesão',
        45,
        55,
        69.5,
        null,
      ],
      [
        'Carne Seca',
        'Carne seca desfiada, cebola, requeijão, pimenta biquinho',
        45,
        55,
        69.5,
        null,
      ],
      ['Dois Queijos', 'Muçarela + requeijão Scala, orégano, azeitonas', 45, 55, 69.5, null],
      ['Três Queijos', 'Muçarela + requeijão + parmesão, orégano, azeitonas', 48, 58, 73.2, null],
      ['Bauru', 'Presunto moído, tomate fresco, muçarela, orégano', 51, 61, 76.7, null],
      ['Vegetariana', 'Brócolis, palmito, milho, azeitonas, cebola, orégano', 48, 58, 73.2, null],
      [
        'Alho Poró',
        'Muçarela, alho-poró refogado na manteiga, parmesão, azeitonas',
        48,
        58,
        73.2,
        null,
      ],
      ['Cabral', 'Calabresa moída, ovo cozido, palmito, muçarela', 48, 58, 73.2, null],
      [
        'Calabresa Especial',
        'Molho barbecue, muçarela, calabresa, cebola caramelizada',
        51,
        61,
        76.7,
        null,
      ],
      ['Portuguesa II', 'Presunto, ovo, palmito, muçarela, bacon, azeitonas', 51, 61, 76.7, null],
      ['Lombo Especial', 'Lombo canadense, cebola, muçarela, molho barbecue', 51, 61, 77.2, null],
      ['Frango Especial', 'Frango desfiado, cebola, parmesão, azeitonas', 52, 62, 78.1, null],
    ]);

    // --- Pizzas Premium ---
    addProducts('Pizzas Premium', [
      ['Camarão', 'Camarões refogados alho e óleo, muçarela, azeitonas', 61, 73, 91.1, null],
      ['Pepperoni', 'Muçarela, pepperoni Sadia, orégano, azeitonas', 54, 64, 80.2, IMG.pepperoni],
      ['Provolombo', 'Lombo canadense, provolone fatiado, orégano, azeitonas', 56, 66, 82.1, null],
    ]);

    // --- Pizzas Doces ---
    addProducts('Pizzas Doces', [
      [
        'Romeu e Julieta',
        'Muçarela + goiabada cremosa, parmesão',
        24.99,
        56,
        69.5,
        IMG.doce_tradicional,
      ],
      [
        'Banana Flambada',
        'Banana, chocolate branco derretido, gratinada, canela',
        24.99,
        56,
        69.5,
        null,
      ],
      ['Banana e Canela', 'Banana, açúcar, canela, leite condensado', 22.99, 51, 63.8, null],
      [
        'Chocolate Avelã',
        'Chocolate avelã (tipo Nutella), avelãs, leite condensado',
        24.99,
        56,
        69.5,
        IMG.chocolate_morango,
      ],
      [
        'Chocolate c/ Morango',
        'Chocolate ao leite, morangos frescos, leite condensado',
        22.99,
        51,
        64.1,
        IMG.chocolate_morango,
      ],
      [
        "Chocolate c/ M&M's",
        "Chocolate ao leite, M&M's, granulado crocante",
        22.99,
        51,
        64.1,
        IMG.chocolate_mms,
      ],
      [
        'Prestígio',
        'Chocolate ao leite, coco ralado, leite condensado, chocolate branco',
        23.99,
        52,
        65.4,
        null,
      ],
      [
        'Brigadeiro',
        'Chocolate ao leite, granulado crocante, leite condensado',
        21.99,
        49,
        61.5,
        IMG.brigadeiro,
      ],
      [
        'Chocolate Branco Flambado',
        'Chocolate branco gratinado, morangos frescos, hortelã',
        24.99,
        55,
        69,
        IMG.chocolate_branco,
      ],
      [
        'Pistache c/ Chocolate Branco',
        'Creme de pistache italiano, chocolate branco, pistache triturado',
        24.99,
        56,
        69.5,
        null,
      ],
      [
        'Chocolate c/ Creme Pistache',
        'Chocolate ao leite, creme pistache, morangos, nozes',
        23.99,
        54,
        67.5,
        null,
      ],
    ]);

    // --- Pastéis ---
    addProducts('Pastéis', [
      [
        'Pastel Carne, Queijo e Bacon',
        'Carne moída, queijo muçarela, bacon crocante',
        null,
        14.99,
        null,
        IMG.pastel,
      ],
      [
        'Pastel Frango c/ Catupiry',
        'Frango desfiado, Catupiry original, azeitonas',
        null,
        13.99,
        null,
        IMG.pastel,
      ],
      [
        'Monte seu Pastel (4 sabores)',
        'Escolha até 4 recheios diferentes',
        null,
        15.99,
        null,
        IMG.pastel,
      ],
      [
        'Monte seu Pastel (3 sabores)',
        'Escolha até 3 recheios diferentes',
        null,
        14.99,
        null,
        IMG.pastel,
      ],
      [
        'Pastel 1 Sabor',
        'Escolha 1 recheio: Carne, Frango, Queijo, Bacon, Palmito, Pizza, Calabresa',
        null,
        12.99,
        null,
        IMG.pastel,
      ],
    ]);

    // --- Beirutes ---
    addProducts('Beirutes', [
      [
        'Beirute Calabresa',
        'Pão sírio, calabresa, cebola roxa, muçarela, cheddar, catupiry, ovo, barbecue, alface, tomate',
        null,
        45,
        null,
        IMG.beirute,
      ],
      [
        'Beirute Carne Seca',
        'Pão sírio, carne seca desfiada, cebola roxa, bacon, pimenta biquinho, maionese, requeijão, alface, tomate',
        null,
        45,
        null,
        IMG.beirute,
      ],
      [
        'Beirute Peito de Peru',
        'Pão sírio, rúcula, peito de peru, muçarela, molho picles, tomate, alface',
        null,
        46,
        null,
        IMG.beirute,
      ],
      [
        'Beirute Atum',
        'Pão sírio, atum, milho, cebola roxa, maionese, requeijão, alface, tomate',
        null,
        46,
        null,
        IMG.beirute,
      ],
      [
        'Beirute Frango',
        'Pão sírio, frango desfiado, palmito, milho, requeijão, muçarela, ovo, maionese, alface, tomate',
        null,
        46,
        null,
        IMG.beirute,
      ],
      [
        'Beirute Presunto',
        'Pão sírio, molho tomate, presunto, muçarela, bacon, ovo, maionese, alface',
        null,
        45,
        null,
        IMG.beirute,
      ],
    ]);

    // --- Porções ---
    addProducts('Porções', [
      [
        'Batata c/ Cheddar e Bacon',
        'Batata frita, cheddar, catupiry, bacon, cebolinha ~500g',
        null,
        30,
        null,
        null,
      ],
      ['Batata Frita', 'Batata frita crocante, sal e ervas ~400g', null, 20, null, null],
      ['Batata c/ Páprica', 'Batata frita com páprica defumada ~400g', null, 20, null, null],
      [
        'Calabresa Acebolada',
        'Calabresa fatiada, cebola refogada, azeite ~500g',
        null,
        27,
        null,
        null,
      ],
      ['Onion Rings', 'Anéis de cebola empanados, molho ranch ~300g', null, 20, null, null],
    ]);

    // --- Refrigerantes ---
    addProducts('Refrigerantes', [
      ['Coca-Cola 350ml Lata', '', null, 7, null, null],
      ['Coca-Cola 600ml', '', null, 10, null, null],
      ['Coca-Cola 1L', '', null, 12, null, null],
      ['Coca-Cola 2L', '', null, 16, null, null],
      ['Guaraná Antarctica 350ml Lata', '', null, 7, null, null],
      ['Guaraná Antarctica 600ml', '', null, 10, null, null],
      ['Guaraná Antarctica 2L', '', null, 16, null, null],
      ['Guaraná Mineiro 269ml', '', null, 3, null, null],
      ['Guaraná Mineiro 350ml', '', null, 4, null, null],
      ['Guaraná Mineiro 600ml', '', null, 5, null, null],
      ['Guaraná Mineiro 1,5L', '', null, 7, null, null],
      ['Guaraná Mineiro 2L', '', null, 9, null, null],
      ['Fanta Laranja 350ml Lata', '', null, 6, null, null],
      ['Fanta Laranja 2L', '', null, 12, null, null],
      ['Sukita 350ml', '', null, 5, null, null],
      ['Sukita 600ml', '', null, 6, null, null],
      ['Sukita 2L', '', null, 9, null, null],
      ['Dolly Guaraná 2L', '', null, 10, null, null],
      ['Itubaína Original 600ml', '', null, 12, null, null],
      ['Itubaína Retro 355ml', '', null, 8, null, null],
    ]);

    // --- Águas e Sucos ---
    addProducts('Águas e Sucos', [
      ['Água Mineral s/ Gás 500ml', '', null, 6, null, null],
      ['Água Mineral c/ Gás 500ml', '', null, 8, null, null],
      ['Água Mineral s/ Gás 1,5L', '', null, 10, null, null],
      ['Suco La Fruit Uva 1L', '', null, 9, null, null],
      ['Suco La Fruit Maracujá 1L', '', null, 9, null, null],
      ['Suco Laranja Natural 300ml', '', null, 12, null, null],
      ['Suco Laranja Natural 500ml', '', null, 15, null, null],
      ['Jarra Suco Natural 750ml', '', null, 30, null, null],
      ['Suco de Polpa 300ml', '', null, 15.9, null, null],
      ['Suco Del Valle 1L', '', null, 13, null, null],
    ]);

    // --- Cervejas e Drinks ---
    addProducts('Cervejas e Drinks', [
      ['Cerveja Amstel 269ml', '', null, 4, null, null],
      ['Cerveja Skol 350ml Lata', '', null, 6, null, null],
      ['Cerveja Itaipava 350ml Lata', '', null, 6, null, null],
      ['Cerveja Heineken 330ml', '', null, 12, null, null],
      ['Cerveja Heineken 600ml', '', null, 18, null, null],
      ['Stella Artois 330ml', '', null, 12, null, null],
      ['Antarctica Original 600ml', '', null, 18, null, null],
      ['Smirnoff Ice 275ml', '', null, 12, null, null],
      ['Chopp de Vinho 600ml', '', null, 16, null, null],
      ['Caipirinha Limão/Morango', 'Caipirinha 300ml', null, 25, null, null],
      ['Taça de Vinho', '150ml', null, 25, null, null],
      ['Garrafa Vinho Santa Rita', '750ml', null, 100, null, null],
      ['Cachaça 50ml', '', null, 10, null, null],
      ['Campari 100ml', '', null, 20, null, null],
      ['Red Bull 250ml', '', null, 15, null, null],
      ['H2OH! Limão/Limoneto 500ml', '', null, 8, null, null],
      ['Água Tônica Antarctica 350ml Lata', '', null, 7, null, null],
      ['Schweppes Citrus 350ml Lata', '', null, 7, null, null],
    ]);

    // --- Outros ---
    addProducts('Outros', [
      ['Crostine', 'Massa fina crocante com azeite, parmesão e orégano', null, 22, null, null],
      ['Calzone', 'Monte o seu (escolha o sabor) + molho tomate + azeitonas', null, 35, null, null],
      ['Massa Pré-assada', 'Para preparo em casa (disco 35cm)', null, 12, null, null],
    ]);
  });

  seed();
  console.log('Database seeded successfully.');
}
