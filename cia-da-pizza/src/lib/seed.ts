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
  pizza_fallback_1:
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
  pizza_fallback_2:
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  pizza_fallback_3:
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
  pizza_fallback_4:
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop',
  pizza_fallback_5:
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop',
  doce_fallback:
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
  pastel_fallback:
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
  beirute_fallback:
    'https://images.unsplash.com/photo-1554433607-66b5a31b28ea?w=400&h=300&fit=crop',
  porcao_fallback:
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
  refrigerante_fallback:
    'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop',
  agua_suco_fallback:
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop',
  cerveja_fallback:
    'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop',
  outros_fallback:
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
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
      [
        'Napolitana',
        'Muçarela, tomate fresco gratinado, orégano, parmesão',
        47,
        57,
        71,
        IMG.pizza_fallback_1,
      ],
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
      [
        'Toscana',
        'Muçarela, calabresa moída temperada, cebolinha, parmesão',
        45,
        55,
        69.4,
        IMG.pizza_fallback_2,
      ],
      [
        'Baiana',
        'Calabresa moída, ovo cozido, pimenta biquinho, azeitonas, cebola',
        45,
        55,
        69.4,
        IMG.pizza_fallback_3,
      ],
      ['Atum', 'Atum sólido, cebola, azeitonas pretas', 45, 55, 69.5, IMG.pizza_fallback_4],
      ['Bacon', 'Muçarela, bacon crocante em cubos, azeitonas, orégano', 45, 55, 69.5, IMG.bacon],
      [
        'Alho e Óleo',
        'Muçarela, alho frito laminado, azeitonas, azeite, orégano',
        44,
        54,
        67.7,
        IMG.pizza_fallback_5,
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
      [
        'Cinco Queijos',
        'Muçarela, provolone, gorgonzola, parmesão, requeijão',
        53,
        63,
        78.4,
        IMG.pizza_fallback_1,
      ],
      [
        'Bersaglieri',
        'Muçarela, aliche, alcaparras, azeitonas, parmesão',
        48,
        58,
        72.7,
        IMG.pizza_fallback_2,
      ],
      [
        'Provoleta',
        'Provolone fatiado, anchova, alcaparras, azeitonas, orégano',
        51,
        61,
        76.8,
        IMG.pizza_fallback_3,
      ],
      [
        'Gorgonzola',
        'Cebola dourada refogada, gorgonzola cremoso, azeitonas',
        48,
        58,
        72.7,
        IMG.pizza_fallback_4,
      ],
      [
        'Salerno',
        'Presunto, gorgonzola, parmesão, tomate fresco, azeitonas',
        51,
        61,
        76.6,
        IMG.pizza_fallback_5,
      ],
      [
        'Conceta',
        'Calabresa moída, requeijão cremoso, azeitonas, orégano',
        46,
        56,
        70.8,
        IMG.pizza_fallback_1,
      ],
      [
        'Macerata',
        'Muçarela, copa italiana, cebola, azeitonas',
        47,
        57,
        71.4,
        IMG.pizza_fallback_2,
      ],
      [
        'Atum Especial',
        'Atum sólido, milho verde, azeitonas, orégano',
        48,
        58,
        73.3,
        IMG.pizza_fallback_3,
      ],
      [
        'Peruana',
        'Atum, ovo cozido, cebola, muçarela, azeitonas',
        51,
        61,
        76.8,
        IMG.pizza_fallback_4,
      ],
      [
        'Aliche',
        'Aliche (anchova), cebola, parmesão, azeitonas',
        51,
        61,
        76.8,
        IMG.pizza_fallback_5,
      ],
      [
        'Romana',
        'Muçarela, aliche, tomate fresco, azeitonas pretas',
        51,
        61,
        77.2,
        IMG.pizza_fallback_1,
      ],
      [
        'Frango c/ Requeijão',
        'Frango desfiado, requeijão Scala, azeitonas, orégano',
        48,
        58,
        73.2,
        IMG.frango_requeijao,
      ],
      [
        'Escarola I',
        'Escarola refogada, bacon, muçarela, azeitonas, alho',
        44,
        54,
        67.7,
        IMG.pizza_fallback_2,
      ],
      [
        'Escarola II',
        'Escarola refogada, bacon, aliche, muçarela, azeitonas',
        48,
        58,
        73.2,
        IMG.pizza_fallback_3,
      ],
      [
        'Siciliana',
        'Cogumelos champignon, bacon, muçarela, azeitonas',
        45,
        55,
        69.5,
        IMG.pizza_fallback_4,
      ],
      [
        'Alcachofra',
        'Muçarela, coração de alcachofra, parmesão, azeite',
        51,
        61,
        76.7,
        IMG.pizza_fallback_5,
      ],
      [
        'Palmito',
        'Palmito pupunha, cebola, muçarela, parmesão, azeitonas',
        51,
        61,
        76.7,
        IMG.pizza_fallback_1,
      ],
      [
        'Rúcula',
        'Rúcula fresca, tomate seco, muçarela de búfala, parmesão, azeite balsâmico',
        48,
        58,
        73.2,
        IMG.pizza_fallback_2,
      ],
      [
        'Verano',
        'Palmito, milho verde, alcaparras, requeijão, azeitonas',
        51,
        61,
        76.7,
        IMG.pizza_fallback_3,
      ],
      [
        'Requeijão Scala',
        'Requeijão cremoso Scala, azeitonas, orégano',
        48,
        58,
        73.2,
        IMG.pizza_fallback_4,
      ],
      [
        'Brócolis',
        'Brócolis refogado alho, bacon, muçarela, azeitonas',
        45,
        55,
        69.5,
        IMG.pizza_fallback_5,
      ],
      [
        'Lombo Canadense',
        'Lombo canadense, cebola, queijo cremoso, azeitonas',
        48,
        58,
        73.2,
        IMG.pizza_fallback_1,
      ],
      [
        'Peito de Peru',
        'Peito de peru, cebola, requeijão, azeitonas',
        48,
        58,
        73.2,
        IMG.pizza_fallback_2,
      ],
      [
        'Abobrinha',
        'Abobrinha italiana grelhada, muçarela, alho frito, parmesão',
        45,
        55,
        69.5,
        IMG.pizza_fallback_3,
      ],
      [
        'Carne Seca',
        'Carne seca desfiada, cebola, requeijão, pimenta biquinho',
        45,
        55,
        69.5,
        IMG.pizza_fallback_4,
      ],
      [
        'Dois Queijos',
        'Muçarela + requeijão Scala, orégano, azeitonas',
        45,
        55,
        69.5,
        IMG.pizza_fallback_5,
      ],
      [
        'Três Queijos',
        'Muçarela + requeijão + parmesão, orégano, azeitonas',
        48,
        58,
        73.2,
        IMG.pizza_fallback_1,
      ],
      [
        'Bauru',
        'Presunto moído, tomate fresco, muçarela, orégano',
        51,
        61,
        76.7,
        IMG.pizza_fallback_2,
      ],
      [
        'Vegetariana',
        'Brócolis, palmito, milho, azeitonas, cebola, orégano',
        48,
        58,
        73.2,
        IMG.pizza_fallback_3,
      ],
      [
        'Alho Poró',
        'Muçarela, alho-poró refogado na manteiga, parmesão, azeitonas',
        48,
        58,
        73.2,
        IMG.pizza_fallback_4,
      ],
      [
        'Cabral',
        'Calabresa moída, ovo cozido, palmito, muçarela',
        48,
        58,
        73.2,
        IMG.pizza_fallback_5,
      ],
      [
        'Calabresa Especial',
        'Molho barbecue, muçarela, calabresa, cebola caramelizada',
        51,
        61,
        76.7,
        IMG.pizza_fallback_1,
      ],
      [
        'Portuguesa II',
        'Presunto, ovo, palmito, muçarela, bacon, azeitonas',
        51,
        61,
        76.7,
        IMG.pizza_fallback_2,
      ],
      [
        'Lombo Especial',
        'Lombo canadense, cebola, muçarela, molho barbecue',
        51,
        61,
        77.2,
        IMG.pizza_fallback_3,
      ],
      [
        'Frango Especial',
        'Frango desfiado, cebola, parmesão, azeitonas',
        52,
        62,
        78.1,
        IMG.pizza_fallback_4,
      ],
    ]);

    // --- Pizzas Premium ---
    addProducts('Pizzas Premium', [
      [
        'Camarão',
        'Camarões refogados alho e óleo, muçarela, azeitonas',
        61,
        73,
        91.1,
        IMG.pizza_fallback_5,
      ],
      ['Pepperoni', 'Muçarela, pepperoni Sadia, orégano, azeitonas', 54, 64, 80.2, IMG.pepperoni],
      [
        'Provolombo',
        'Lombo canadense, provolone fatiado, orégano, azeitonas',
        56,
        66,
        82.1,
        IMG.pizza_fallback_1,
      ],
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
        IMG.doce_fallback,
      ],
      [
        'Banana e Canela',
        'Banana, açúcar, canela, leite condensado',
        22.99,
        51,
        63.8,
        IMG.doce_fallback,
      ],
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
        IMG.doce_fallback,
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
        IMG.doce_fallback,
      ],
      [
        'Chocolate c/ Creme Pistache',
        'Chocolate ao leite, creme pistache, morangos, nozes',
        23.99,
        54,
        67.5,
        IMG.doce_fallback,
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
        IMG.porcao_fallback,
      ],
      [
        'Batata Frita',
        'Batata frita crocante, sal e ervas ~400g',
        null,
        20,
        null,
        IMG.porcao_fallback,
      ],
      [
        'Batata c/ Páprica',
        'Batata frita com páprica defumada ~400g',
        null,
        20,
        null,
        IMG.porcao_fallback,
      ],
      [
        'Calabresa Acebolada',
        'Calabresa fatiada, cebola refogada, azeite ~500g',
        null,
        27,
        null,
        IMG.porcao_fallback,
      ],
      [
        'Onion Rings',
        'Anéis de cebola empanados, molho ranch ~300g',
        null,
        20,
        null,
        IMG.porcao_fallback,
      ],
    ]);

    // --- Refrigerantes ---
    addProducts('Refrigerantes', [
      ['Coca-Cola 350ml Lata', '', null, 7, null, IMG.refrigerante_fallback],
      ['Coca-Cola 600ml', '', null, 10, null, IMG.refrigerante_fallback],
      ['Coca-Cola 1L', '', null, 12, null, IMG.refrigerante_fallback],
      ['Coca-Cola 2L', '', null, 16, null, IMG.refrigerante_fallback],
      ['Guaraná Antarctica 350ml Lata', '', null, 7, null, IMG.refrigerante_fallback],
      ['Guaraná Antarctica 600ml', '', null, 10, null, IMG.refrigerante_fallback],
      ['Guaraná Antarctica 2L', '', null, 16, null, IMG.refrigerante_fallback],
      ['Guaraná Mineiro 269ml', '', null, 3, null, IMG.refrigerante_fallback],
      ['Guaraná Mineiro 350ml', '', null, 4, null, IMG.refrigerante_fallback],
      ['Guaraná Mineiro 600ml', '', null, 5, null, IMG.refrigerante_fallback],
      ['Guaraná Mineiro 1,5L', '', null, 7, null, IMG.refrigerante_fallback],
      ['Guaraná Mineiro 2L', '', null, 9, null, IMG.refrigerante_fallback],
      ['Fanta Laranja 350ml Lata', '', null, 6, null, IMG.refrigerante_fallback],
      ['Fanta Laranja 2L', '', null, 12, null, IMG.refrigerante_fallback],
      ['Sukita 350ml', '', null, 5, null, IMG.refrigerante_fallback],
      ['Sukita 600ml', '', null, 6, null, IMG.refrigerante_fallback],
      ['Sukita 2L', '', null, 9, null, IMG.refrigerante_fallback],
      ['Dolly Guaraná 2L', '', null, 10, null, IMG.refrigerante_fallback],
      ['Itubaína Original 600ml', '', null, 12, null, IMG.refrigerante_fallback],
      ['Itubaína Retro 355ml', '', null, 8, null, IMG.refrigerante_fallback],
    ]);

    // --- Águas e Sucos ---
    addProducts('Águas e Sucos', [
      ['Água Mineral s/ Gás 500ml', '', null, 6, null, IMG.agua_suco_fallback],
      ['Água Mineral c/ Gás 500ml', '', null, 8, null, IMG.agua_suco_fallback],
      ['Água Mineral s/ Gás 1,5L', '', null, 10, null, IMG.agua_suco_fallback],
      ['Suco La Fruit Uva 1L', '', null, 9, null, IMG.agua_suco_fallback],
      ['Suco La Fruit Maracujá 1L', '', null, 9, null, IMG.agua_suco_fallback],
      ['Suco Laranja Natural 300ml', '', null, 12, null, IMG.agua_suco_fallback],
      ['Suco Laranja Natural 500ml', '', null, 15, null, IMG.agua_suco_fallback],
      ['Jarra Suco Natural 750ml', '', null, 30, null, IMG.agua_suco_fallback],
      ['Suco de Polpa 300ml', '', null, 15.9, null, IMG.agua_suco_fallback],
      ['Suco Del Valle 1L', '', null, 13, null, IMG.agua_suco_fallback],
    ]);

    // --- Cervejas e Drinks ---
    addProducts('Cervejas e Drinks', [
      ['Cerveja Amstel 269ml', '', null, 4, null, IMG.cerveja_fallback],
      ['Cerveja Skol 350ml Lata', '', null, 6, null, IMG.cerveja_fallback],
      ['Cerveja Itaipava 350ml Lata', '', null, 6, null, IMG.cerveja_fallback],
      ['Cerveja Heineken 330ml', '', null, 12, null, IMG.cerveja_fallback],
      ['Cerveja Heineken 600ml', '', null, 18, null, IMG.cerveja_fallback],
      ['Stella Artois 330ml', '', null, 12, null, IMG.cerveja_fallback],
      ['Antarctica Original 600ml', '', null, 18, null, IMG.cerveja_fallback],
      ['Smirnoff Ice 275ml', '', null, 12, null, IMG.cerveja_fallback],
      ['Chopp de Vinho 600ml', '', null, 16, null, IMG.cerveja_fallback],
      ['Caipirinha Limão/Morango', 'Caipirinha 300ml', null, 25, null, IMG.cerveja_fallback],
      ['Taça de Vinho', '150ml', null, 25, null, IMG.cerveja_fallback],
      ['Garrafa Vinho Santa Rita', '750ml', null, 100, null, IMG.cerveja_fallback],
      ['Cachaça 50ml', '', null, 10, null, IMG.cerveja_fallback],
      ['Campari 100ml', '', null, 20, null, IMG.cerveja_fallback],
      ['Red Bull 250ml', '', null, 15, null, IMG.cerveja_fallback],
      ['H2OH! Limão/Limoneto 500ml', '', null, 8, null, IMG.cerveja_fallback],
      ['Água Tônica Antarctica 350ml Lata', '', null, 7, null, IMG.cerveja_fallback],
      ['Schweppes Citrus 350ml Lata', '', null, 7, null, IMG.cerveja_fallback],
    ]);

    // --- Outros ---
    addProducts('Outros', [
      [
        'Crostine',
        'Massa fina crocante com azeite, parmesão e orégano',
        null,
        22,
        null,
        IMG.outros_fallback,
      ],
      [
        'Calzone',
        'Monte o seu (escolha o sabor) + molho tomate + azeitonas',
        null,
        35,
        null,
        IMG.outros_fallback,
      ],
      [
        'Massa Pré-assada',
        'Para preparo em casa (disco 35cm)',
        null,
        12,
        null,
        IMG.outros_fallback,
      ],
    ]);
  });

  seed();
  console.log('Database seeded successfully.');
}
