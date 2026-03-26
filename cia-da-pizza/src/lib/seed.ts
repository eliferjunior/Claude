import type Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

type ProductSeed = {
  name: string;
  description: string;
  price_small: number | null;
  price_medium: number | null;
  price_large: number | null;
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

    // --- Categories ---
    const insertCategory = db.prepare(
      'INSERT INTO categories (name, order_position, active) VALUES (?, ?, 1)',
    );

    const categories: { name: string; order: number }[] = [
      { name: 'Pizzas Tradicionais', order: 1 },
      { name: 'Pizzas Especiais', order: 2 },
      { name: 'Pizzas Doces', order: 3 },
      { name: 'Hambúrgueres', order: 4 },
      { name: 'Porções', order: 5 },
      { name: 'Bebidas', order: 6 },
      { name: 'Sobremesas', order: 7 },
    ];

    const categoryIds: Record<string, number> = {};
    for (const cat of categories) {
      const result = insertCategory.run(cat.name, cat.order);
      categoryIds[cat.name] = Number(result.lastInsertRowid);
    }

    // --- Products ---
    const insertProduct = db.prepare(`
      INSERT INTO products (category_id, name, description, price_small, price_medium, price_large, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    // Pizzas Tradicionais
    const tradicionais: ProductSeed[] = [
      {
        name: 'Margherita',
        description: 'Molho de tomate, mussarela, tomate fatiado e manjericão fresco',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Calabresa',
        description: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Portuguesa',
        description: 'Molho de tomate, mussarela, presunto, ovo, cebola, ervilha e azeitona',
        price_small: 31.9,
        price_medium: 42.9,
        price_large: 52.9,
      },
      {
        name: 'Mussarela',
        description: 'Molho de tomate, mussarela e orégano',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Frango com Catupiry',
        description: 'Molho de tomate, mussarela, frango desfiado e catupiry',
        price_small: 32.9,
        price_medium: 43.9,
        price_large: 54.9,
      },
      {
        name: 'Quatro Queijos',
        description: 'Molho de tomate, mussarela, provolone, gorgonzola e parmesão',
        price_small: 34.9,
        price_medium: 44.9,
        price_large: 54.9,
      },
      {
        name: 'Napolitana',
        description: 'Molho de tomate, mussarela, tomate, parmesão e manjericão',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Presunto',
        description: 'Molho de tomate, mussarela e presunto',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Milho',
        description: 'Molho de tomate, mussarela e milho verde',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Bacon',
        description: 'Molho de tomate, mussarela e bacon crocante',
        price_small: 32.9,
        price_medium: 42.9,
        price_large: 52.9,
      },
      {
        name: 'Lombo Canadense',
        description: 'Molho de tomate, mussarela, lombo canadense e catupiry',
        price_small: 34.9,
        price_medium: 44.9,
        price_large: 54.9,
      },
      {
        name: 'Pepperoni',
        description: 'Molho de tomate, mussarela e pepperoni',
        price_small: 33.9,
        price_medium: 43.9,
        price_large: 53.9,
      },
      {
        name: 'Atum',
        description: 'Molho de tomate, mussarela, atum e cebola',
        price_small: 32.9,
        price_medium: 42.9,
        price_large: 52.9,
      },
    ];

    for (const p of tradicionais) {
      insertProduct.run(
        categoryIds['Pizzas Tradicionais'],
        p.name,
        p.description,
        p.price_small,
        p.price_medium,
        p.price_large,
      );
    }

    // Pizzas Especiais
    const especiais: ProductSeed[] = [
      {
        name: 'Strogonoff',
        description: 'Molho de tomate, mussarela, strogonoff de carne e batata palha',
        price_small: 39.9,
        price_medium: 49.9,
        price_large: 59.9,
      },
      {
        name: 'Camarão',
        description: 'Molho de tomate, mussarela, camarão refogado e catupiry',
        price_small: 42.9,
        price_medium: 54.9,
        price_large: 69.9,
      },
      {
        name: 'Carne Seca',
        description: 'Molho de tomate, mussarela, carne seca desfiada, cebola e catupiry',
        price_small: 39.9,
        price_medium: 49.9,
        price_large: 62.9,
      },
      {
        name: 'Filé Mignon',
        description: 'Molho de tomate, mussarela, filé mignon em tiras e catupiry',
        price_small: 42.9,
        price_medium: 54.9,
        price_large: 67.9,
      },
      {
        name: 'Costela',
        description: 'Molho de tomate, mussarela, costela desfiada e barbecue',
        price_small: 42.9,
        price_medium: 54.9,
        price_large: 67.9,
      },
      {
        name: 'Alcatra',
        description: 'Molho de tomate, mussarela, alcatra em tiras, cebola e pimentão',
        price_small: 39.9,
        price_medium: 49.9,
        price_large: 62.9,
      },
      {
        name: 'Brócolis com Bacon',
        description: 'Molho de tomate, mussarela, brócolis, bacon e catupiry',
        price_small: 37.9,
        price_medium: 47.9,
        price_large: 59.9,
      },
      {
        name: 'Supreme',
        description:
          'Molho de tomate, mussarela, pepperoni, pimentão, cebola, azeitona e champignon',
        price_small: 39.9,
        price_medium: 49.9,
        price_large: 62.9,
      },
      {
        name: 'Parma',
        description: 'Molho de tomate, mussarela, presunto parma, rúcula e parmesão',
        price_small: 42.9,
        price_medium: 54.9,
        price_large: 67.9,
      },
    ];

    for (const p of especiais) {
      insertProduct.run(
        categoryIds['Pizzas Especiais'],
        p.name,
        p.description,
        p.price_small,
        p.price_medium,
        p.price_large,
      );
    }

    // Pizzas Doces
    const doces: ProductSeed[] = [
      {
        name: 'Chocolate',
        description: 'Chocolate ao leite derretido, granulado e leite condensado',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Banana com Canela',
        description: 'Banana fatiada, canela, açúcar e leite condensado',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Romeu e Julieta',
        description: 'Goiabada derretida e queijo mussarela',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Prestígio',
        description: 'Chocolate ao leite e coco ralado',
        price_small: 31.9,
        price_medium: 41.9,
        price_large: 51.9,
      },
      {
        name: 'Brigadeiro',
        description: 'Brigadeiro, granulado de chocolate e leite condensado',
        price_small: 31.9,
        price_medium: 41.9,
        price_large: 51.9,
      },
      {
        name: 'Doce de Leite',
        description: 'Doce de leite, coco ralado e canela',
        price_small: 29.9,
        price_medium: 39.9,
        price_large: 49.9,
      },
      {
        name: 'Morango com Nutella',
        description: 'Nutella, morangos frescos fatiados e leite condensado',
        price_small: 34.9,
        price_medium: 44.9,
        price_large: 54.9,
      },
    ];

    for (const p of doces) {
      insertProduct.run(
        categoryIds['Pizzas Doces'],
        p.name,
        p.description,
        p.price_small,
        p.price_medium,
        p.price_large,
      );
    }

    // Hambúrgueres (single price, no sizes)
    const burgers: ProductSeed[] = [
      {
        name: 'Classic Burger',
        description: 'Pão brioche, hambúrguer 180g, alface, tomate, cebola roxa e molho especial',
        price_small: null,
        price_medium: 22.9,
        price_large: null,
      },
      {
        name: 'Cheese Burger',
        description:
          'Pão brioche, hambúrguer 180g, queijo cheddar duplo, alface, tomate e molho especial',
        price_small: null,
        price_medium: 26.9,
        price_large: null,
      },
      {
        name: 'Bacon Burger',
        description:
          'Pão brioche, hambúrguer 180g, bacon crocante, queijo cheddar, alface e molho barbecue',
        price_small: null,
        price_medium: 29.9,
        price_large: null,
      },
      {
        name: 'Double Burger',
        description:
          'Pão brioche, dois hambúrgueres 180g, queijo cheddar duplo, bacon, cebola caramelizada e molho especial',
        price_small: null,
        price_medium: 34.9,
        price_large: null,
      },
    ];

    for (const p of burgers) {
      insertProduct.run(
        categoryIds['Hambúrgueres'],
        p.name,
        p.description,
        p.price_small,
        p.price_medium,
        p.price_large,
      );
    }

    // Porções
    const porcoes: ProductSeed[] = [
      {
        name: 'Batata Frita',
        description: 'Porção generosa de batata frita crocante com sal e orégano',
        price_small: null,
        price_medium: 24.9,
        price_large: null,
      },
      {
        name: 'Frango à Passarinho',
        description: 'Coxinhas de frango temperadas e fritas, acompanha limão',
        price_small: null,
        price_medium: 29.9,
        price_large: null,
      },
      {
        name: 'Polenta Frita',
        description: 'Palitos de polenta fritos e crocantes',
        price_small: null,
        price_medium: 19.9,
        price_large: null,
      },
      {
        name: 'Mandioca Frita',
        description: 'Mandioca cozida e frita, crocante por fora e macia por dentro',
        price_small: null,
        price_medium: 22.9,
        price_large: null,
      },
    ];

    for (const p of porcoes) {
      insertProduct.run(
        categoryIds['Porções'],
        p.name,
        p.description,
        p.price_small,
        p.price_medium,
        p.price_large,
      );
    }

    // Bebidas
    const bebidas: ProductSeed[] = [
      {
        name: 'Coca-Cola 2L',
        description: 'Refrigerante Coca-Cola garrafa 2 litros',
        price_small: null,
        price_medium: 14.9,
        price_large: null,
      },
      {
        name: 'Guaraná 2L',
        description: 'Refrigerante Guaraná Antarctica garrafa 2 litros',
        price_small: null,
        price_medium: 12.9,
        price_large: null,
      },
      {
        name: 'Suco Natural',
        description: 'Suco natural da fruta (laranja, limão, maracujá ou abacaxi) - 500ml',
        price_small: null,
        price_medium: 10.9,
        price_large: null,
      },
      {
        name: 'Água',
        description: 'Água mineral sem gás 500ml',
        price_small: null,
        price_medium: 5.9,
        price_large: null,
      },
      {
        name: 'Cerveja',
        description: 'Cerveja long neck 355ml (Original, Heineken ou Brahma)',
        price_small: null,
        price_medium: 11.9,
        price_large: null,
      },
    ];

    for (const p of bebidas) {
      insertProduct.run(
        categoryIds['Bebidas'],
        p.name,
        p.description,
        p.price_small,
        p.price_medium,
        p.price_large,
      );
    }

    // Sobremesas
    const sobremesas: ProductSeed[] = [
      {
        name: 'Petit Gateau',
        description: 'Bolo quente de chocolate com sorvete de creme e calda de chocolate',
        price_small: null,
        price_medium: 24.9,
        price_large: null,
      },
      {
        name: 'Brownie',
        description: 'Brownie de chocolate com sorvete de creme e calda',
        price_small: null,
        price_medium: 19.9,
        price_large: null,
      },
      {
        name: 'Açaí',
        description: 'Tigela de açaí 500ml com granola, banana e leite condensado',
        price_small: null,
        price_medium: 22.9,
        price_large: null,
      },
    ];

    for (const p of sobremesas) {
      insertProduct.run(
        categoryIds['Sobremesas'],
        p.name,
        p.description,
        p.price_small,
        p.price_medium,
        p.price_large,
      );
    }
  });

  seed();
  console.log('Database seeded successfully.');
}
