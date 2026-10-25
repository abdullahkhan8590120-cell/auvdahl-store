import type { Product } from '../types'
// Product photos are resolved from the slug by <ProductImage> (see public/products/). Static catalogue. Phase 3 moves prices/stock to Supabase (server is the source of truth for pricing).
export const products: Product[] = [
 {slug:'solaris',name:'SOLARIS',priceSar:199,sizeMl:50,family:'Fresh Citrus',top:['Bergamot','Lemon','Mandarin'],heart:['Lavender','Neroli','Green Tea'],base:['Cedarwood','Musk','Amber'],description:'A radiant expression of freshness, where vibrant citrus meets aromatic elegance and a warm, refined base.'},
 {slug:'lyrana',name:'LYRANA',priceSar:249,sizeMl:50,family:'Floral',top:['Peony','Lychee','Bergamot'],heart:['Rose','Jasmine','Violet'],base:['Musk','Amber','Sandalwood'],description:'A graceful floral composition blending delicate blossoms with luminous fruits and soft, luxurious woods.'},
 {slug:'noctis',name:'NOCTIS',priceSar:299,sizeMl:50,family:'Woody',top:['Black Pepper','Cardamom','Bergamot'],heart:['Cedarwood','Vetiver','Lavender'],base:['Sandalwood','Musk','Amber'],description:'A captivating woody fragrance defined by aromatic spices, deep woods, and understated sophistication.'},
 {slug:'ambrex',name:'AMBREX',priceSar:349,sizeMl:50,family:'Amber',top:['Bergamot','Saffron','Cinnamon'],heart:['Amber','Labdanum','Cedarwood'],base:['Vanilla','Tonka Bean','Musk'],description:'An opulent amber creation where golden warmth, exquisite spices, and rich sweetness meet.'},
 {slug:'vanzer',name:'VANZÉR',priceSar:279,sizeMl:50,family:'Gourmand',top:['Vanilla','Pear','Caramel'],heart:['Jasmine','Almond','Honey'],base:['Sandalwood','Musk','Tonka Bean'],description:'A sophisticated gourmand fragrance featuring creamy sweetness, delicate florals, and smooth woods.'},
 {slug:'zaffir',name:'ZAFFIR',priceSar:499,sizeMl:50,family:'Arabian Oud',top:['Saffron','Nutmeg','Bergamot'],heart:['Rose','Oud','Patchouli'],base:['Leather Accord','Amber','Musk'],description:'A majestic Arabian oud composition combining precious spices, rich woods, and timeless elegance.',flagship:true},
]
export const sar = (n:number) => `SAR ${n.toLocaleString('en-US')}`
