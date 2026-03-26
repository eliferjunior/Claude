"use strict";exports.id=748,exports.ids=[748],exports.modules={5748:(e,a,r)=>{r.d(a,{Z:()=>p});var i=r(5890),o=r.n(i),l=r(5315),c=r.n(l),s=r(2048),m=r.n(s);let n=c().join(process.cwd(),"data","pizza.db"),t=c().dirname(n);m().existsSync(t)||m().mkdirSync(t,{recursive:!0});let d=new(o())(n);d.pragma("journal_mode = WAL"),d.pragma("foreign_keys = ON"),function(){if(d.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      order_position INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price_small REAL,
      price_medium REAL,
      price_large REAL,
      image_url TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      whatsapp TEXT,
      opening_hours TEXT,
      closing_hours TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      is_delivery INTEGER NOT NULL DEFAULT 0,
      lat REAL,
      lng REAL,
      allows_delivery INTEGER DEFAULT 1,
      allows_pickup INTEGER DEFAULT 1,
      allows_reservation INTEGER DEFAULT 1,
      allows_dine_in INTEGER DEFAULT 1,
      whatsapp_number TEXT DEFAULT '',
      whatsapp_message TEXT DEFAULT 'Ol\xe1! Gostaria de fazer um pedido.',
      login_username TEXT UNIQUE,
      login_password_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup', 'dine_in')),
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      size TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_email TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_store ON reservations(store_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
  `),0===d.prepare("SELECT COUNT(*) as count FROM categories").get().count){let{seedDatabase:e}=r(6818);e(d)}}();let p=d},6818:(e,a,r)=>{r.r(a),r.d(a,{seedDatabase:()=>o});var i=r(8691);function o(e){console.log("Seeding database with initial data..."),e.transaction(()=>{let a=i.ZP.hashSync("admin123",10);e.prepare("INSERT INTO admin_users (username, password_hash, name, role) VALUES (?, ?, ?, ?)").run("admin",a,"Administrador","super_admin");let r=i.ZP.hashSync("loja123",10),o=e.prepare(`
      INSERT INTO stores (name, address, phone, whatsapp, opening_hours, closing_hours, active, is_delivery, login_username, login_password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);o.run("Loja 1 - H\xe9lio Palermo","Av. Dr. H\xe9lio Palermo, 2811, Franca/SP","(16) 3711-1111","5516937111111","18:00","23:00",1,0,"loja1",r),o.run("Loja 2 - Parque Progresso","Franca/SP","(16) 3711-2222","5516937112222","18:00","23:00",1,0,"loja2",r),o.run("Loja 4 - Delivery","Av. Adhemar Pereira de Barros, 1474, Franca/SP","(16) 3711-4444","5516937114444","18:00","23:30",1,1,"loja4",r),o.run("Loja 6 - Pulicano","Franca/SP","(16) 3711-6666","5516937116666","18:00","23:00",1,0,"loja6",r);let l=e.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");l.run("whatsapp_enabled","1"),l.run("whatsapp_number","16999999999"),l.run("whatsapp_default_message","Ol\xe1! Gostaria de fazer um pedido na Cia da Pizza!"),l.run("company_name","Cia da Pizza"),l.run("company_logo_url",""),l.run("company_instagram","https://www.instagram.com/pizzacompanhiada"),l.run("company_facebook","https://www.facebook.com/ciadapizz"),l.run("primary_color","#DC2626"),l.run("secondary_color","#EAB308");let c=e.prepare("INSERT INTO categories (name, order_position, active) VALUES (?, ?, 1)"),s={};for(let e of[{name:"Pizzas Tradicionais",order:1},{name:"Pizzas Especiais",order:2},{name:"Pizzas Doces",order:3},{name:"Hamb\xfargueres",order:4},{name:"Por\xe7\xf5es",order:5},{name:"Bebidas",order:6},{name:"Sobremesas",order:7}]){let a=c.run(e.name,e.order);s[e.name]=Number(a.lastInsertRowid)}let m=e.prepare(`
      INSERT INTO products (category_id, name, description, price_small, price_medium, price_large, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);for(let e of[{name:"Margherita",description:"Molho de tomate, mussarela, tomate fatiado e manjeric\xe3o fresco",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Calabresa",description:"Molho de tomate, mussarela, calabresa fatiada e cebola",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Portuguesa",description:"Molho de tomate, mussarela, presunto, ovo, cebola, ervilha e azeitona",price_small:31.9,price_medium:42.9,price_large:52.9},{name:"Mussarela",description:"Molho de tomate, mussarela e or\xe9gano",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Frango com Catupiry",description:"Molho de tomate, mussarela, frango desfiado e catupiry",price_small:32.9,price_medium:43.9,price_large:54.9},{name:"Quatro Queijos",description:"Molho de tomate, mussarela, provolone, gorgonzola e parmes\xe3o",price_small:34.9,price_medium:44.9,price_large:54.9},{name:"Napolitana",description:"Molho de tomate, mussarela, tomate, parmes\xe3o e manjeric\xe3o",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Presunto",description:"Molho de tomate, mussarela e presunto",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Milho",description:"Molho de tomate, mussarela e milho verde",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Bacon",description:"Molho de tomate, mussarela e bacon crocante",price_small:32.9,price_medium:42.9,price_large:52.9},{name:"Lombo Canadense",description:"Molho de tomate, mussarela, lombo canadense e catupiry",price_small:34.9,price_medium:44.9,price_large:54.9},{name:"Pepperoni",description:"Molho de tomate, mussarela e pepperoni",price_small:33.9,price_medium:43.9,price_large:53.9},{name:"Atum",description:"Molho de tomate, mussarela, atum e cebola",price_small:32.9,price_medium:42.9,price_large:52.9}])m.run(s["Pizzas Tradicionais"],e.name,e.description,e.price_small,e.price_medium,e.price_large);for(let e of[{name:"Strogonoff",description:"Molho de tomate, mussarela, strogonoff de carne e batata palha",price_small:39.9,price_medium:49.9,price_large:59.9},{name:"Camar\xe3o",description:"Molho de tomate, mussarela, camar\xe3o refogado e catupiry",price_small:42.9,price_medium:54.9,price_large:69.9},{name:"Carne Seca",description:"Molho de tomate, mussarela, carne seca desfiada, cebola e catupiry",price_small:39.9,price_medium:49.9,price_large:62.9},{name:"Fil\xe9 Mignon",description:"Molho de tomate, mussarela, fil\xe9 mignon em tiras e catupiry",price_small:42.9,price_medium:54.9,price_large:67.9},{name:"Costela",description:"Molho de tomate, mussarela, costela desfiada e barbecue",price_small:42.9,price_medium:54.9,price_large:67.9},{name:"Alcatra",description:"Molho de tomate, mussarela, alcatra em tiras, cebola e piment\xe3o",price_small:39.9,price_medium:49.9,price_large:62.9},{name:"Br\xf3colis com Bacon",description:"Molho de tomate, mussarela, br\xf3colis, bacon e catupiry",price_small:37.9,price_medium:47.9,price_large:59.9},{name:"Supreme",description:"Molho de tomate, mussarela, pepperoni, piment\xe3o, cebola, azeitona e champignon",price_small:39.9,price_medium:49.9,price_large:62.9},{name:"Parma",description:"Molho de tomate, mussarela, presunto parma, r\xfacula e parmes\xe3o",price_small:42.9,price_medium:54.9,price_large:67.9}])m.run(s["Pizzas Especiais"],e.name,e.description,e.price_small,e.price_medium,e.price_large);for(let e of[{name:"Chocolate",description:"Chocolate ao leite derretido, granulado e leite condensado",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Banana com Canela",description:"Banana fatiada, canela, a\xe7\xfacar e leite condensado",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Romeu e Julieta",description:"Goiabada derretida e queijo mussarela",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Prest\xedgio",description:"Chocolate ao leite e coco ralado",price_small:31.9,price_medium:41.9,price_large:51.9},{name:"Brigadeiro",description:"Brigadeiro, granulado de chocolate e leite condensado",price_small:31.9,price_medium:41.9,price_large:51.9},{name:"Doce de Leite",description:"Doce de leite, coco ralado e canela",price_small:29.9,price_medium:39.9,price_large:49.9},{name:"Morango com Nutella",description:"Nutella, morangos frescos fatiados e leite condensado",price_small:34.9,price_medium:44.9,price_large:54.9}])m.run(s["Pizzas Doces"],e.name,e.description,e.price_small,e.price_medium,e.price_large);for(let e of[{name:"Classic Burger",description:"P\xe3o brioche, hamb\xfarguer 180g, alface, tomate, cebola roxa e molho especial",price_small:null,price_medium:22.9,price_large:null},{name:"Cheese Burger",description:"P\xe3o brioche, hamb\xfarguer 180g, queijo cheddar duplo, alface, tomate e molho especial",price_small:null,price_medium:26.9,price_large:null},{name:"Bacon Burger",description:"P\xe3o brioche, hamb\xfarguer 180g, bacon crocante, queijo cheddar, alface e molho barbecue",price_small:null,price_medium:29.9,price_large:null},{name:"Double Burger",description:"P\xe3o brioche, dois hamb\xfargueres 180g, queijo cheddar duplo, bacon, cebola caramelizada e molho especial",price_small:null,price_medium:34.9,price_large:null}])m.run(s["Hamb\xfargueres"],e.name,e.description,e.price_small,e.price_medium,e.price_large);for(let e of[{name:"Batata Frita",description:"Por\xe7\xe3o generosa de batata frita crocante com sal e or\xe9gano",price_small:null,price_medium:24.9,price_large:null},{name:"Frango \xe0 Passarinho",description:"Coxinhas de frango temperadas e fritas, acompanha lim\xe3o",price_small:null,price_medium:29.9,price_large:null},{name:"Polenta Frita",description:"Palitos de polenta fritos e crocantes",price_small:null,price_medium:19.9,price_large:null},{name:"Mandioca Frita",description:"Mandioca cozida e frita, crocante por fora e macia por dentro",price_small:null,price_medium:22.9,price_large:null}])m.run(s["Por\xe7\xf5es"],e.name,e.description,e.price_small,e.price_medium,e.price_large);for(let e of[{name:"Coca-Cola 2L",description:"Refrigerante Coca-Cola garrafa 2 litros",price_small:null,price_medium:14.9,price_large:null},{name:"Guaran\xe1 2L",description:"Refrigerante Guaran\xe1 Antarctica garrafa 2 litros",price_small:null,price_medium:12.9,price_large:null},{name:"Suco Natural",description:"Suco natural da fruta (laranja, lim\xe3o, maracuj\xe1 ou abacaxi) - 500ml",price_small:null,price_medium:10.9,price_large:null},{name:"\xc1gua",description:"\xc1gua mineral sem g\xe1s 500ml",price_small:null,price_medium:5.9,price_large:null},{name:"Cerveja",description:"Cerveja long neck 355ml (Original, Heineken ou Brahma)",price_small:null,price_medium:11.9,price_large:null}])m.run(s.Bebidas,e.name,e.description,e.price_small,e.price_medium,e.price_large);for(let e of[{name:"Petit Gateau",description:"Bolo quente de chocolate com sorvete de creme e calda de chocolate",price_small:null,price_medium:24.9,price_large:null},{name:"Brownie",description:"Brownie de chocolate com sorvete de creme e calda",price_small:null,price_medium:19.9,price_large:null},{name:"A\xe7a\xed",description:"Tigela de a\xe7a\xed 500ml com granola, banana e leite condensado",price_small:null,price_medium:22.9,price_large:null}])m.run(s.Sobremesas,e.name,e.description,e.price_small,e.price_medium,e.price_large)})(),console.log("Database seeded successfully.")}}};