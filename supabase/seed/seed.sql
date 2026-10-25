-- Run after migration 001. Stock starts at ZERO until you enter real inventory.
insert into public.products (slug,name,price_sar,size_ml,family,top_notes,heart_notes,base_notes,description,image_key,sort_order) values
('solaris','SOLARIS',199,50,'Fresh Citrus','{Bergamot,Lemon,Mandarin}','{Lavender,Neroli,"Green Tea"}','{Cedarwood,Musk,Amber}','A radiant expression of freshness, where vibrant citrus meets aromatic elegance and a warm, refined base.','solaris',1),
('lyrana','LYRANA',249,50,'Floral','{Peony,Lychee,Bergamot}','{Rose,Jasmine,Violet}','{Musk,Amber,Sandalwood}','A graceful floral composition blending delicate blossoms with luminous fruits and soft, luxurious woods.','lyrana',2),
('noctis','NOCTIS',299,50,'Woody','{"Black Pepper",Cardamom,Bergamot}','{Cedarwood,Vetiver,Lavender}','{Sandalwood,Musk,Amber}','A captivating woody fragrance defined by aromatic spices, deep woods, and understated sophistication.','noctis',3),
('ambrex','AMBREX',349,50,'Amber','{Bergamot,Saffron,Cinnamon}','{Amber,Labdanum,Cedarwood}','{Vanilla,"Tonka Bean",Musk}','An opulent amber creation where golden warmth, exquisite spices, and rich sweetness meet.','ambrex',4),
('vanzer','VANZÉR',279,50,'Gourmand','{Vanilla,Pear,Caramel}','{Jasmine,Almond,Honey}','{Sandalwood,Musk,"Tonka Bean"}','A sophisticated gourmand fragrance featuring creamy sweetness, delicate florals, and smooth woods.','vanzer',5),
('zaffir','ZAFFIR',499,50,'Arabian Oud','{Saffron,Nutmeg,Bergamot}','{Rose,Oud,Patchouli}','{"Leather Accord",Amber,Musk}','A majestic Arabian oud composition combining precious spices, rich woods, and timeless elegance.','zaffir',6)
on conflict (slug) do update set price_sar=excluded.price_sar, name=excluded.name, top_notes=excluded.top_notes;
insert into public.inventory (product_id) select id from public.products on conflict do nothing;
insert into public.store_settings (key,value,is_public) values ('whatsapp_number','"966532903358"',true) on conflict do nothing;
