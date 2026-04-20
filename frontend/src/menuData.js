const menuData = {
  en: [
    {
      id: "griot",
      name: "Griot",
      image: "https://images.pexels.com/photos/9609848/pexels-photo-9609848.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 1, name: "Classic Griot", description: "Traditional Haitian marinated pork, citrus-braised and fried crispy golden", spicy: false },
        { id: 2, name: "Griot Plate", description: "Classic Griot with rice & beans and sweet plantains on the side", spicy: false },
        { id: 3, name: "Griot with Pikliz", description: "Signature griot paired with habanero pickled vegetables for extra heat", spicy: true },
      ],
    },
    {
      id: "jerk",
      name: "Jerk Chicken",
      image: "https://images.pexels.com/photos/27556985/pexels-photo-27556985.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 4, name: "Jerk Chicken Plate", description: "Half chicken marinated in island spices, grilled, served with coconut rice", spicy: true },
        { id: 5, name: "Jerk Chicken Strips", description: "Tender strips of jerk chicken, perfect for sharing or a light meal", spicy: true },
        { id: 6, name: "Jerk Chicken Combo", description: "Jerk chicken with rice & beans, plantains, and signature sauce", spicy: true },
      ],
    },
    {
      id: "rice",
      name: "Rice & Beans",
      image: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 7, name: "Coconut Rice & Beans", description: "Creamy coconut rice with red kidney beans and Creole seasoning", spicy: false },
        { id: 8, name: "Riz Djon Djon", description: "Black mushroom rice — a beloved Haitian specialty with deep earthy flavor", spicy: false },
        { id: 9, name: "Rice Bowl", description: "Rice & beans topped with your choice of griot or jerk chicken", spicy: false },
      ],
    },
    {
      id: "plantains",
      name: "Plantains",
      image: "https://images.pexels.com/photos/27556971/pexels-photo-27556971.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 10, name: "Sweet Plantains (Maduros)", description: "Golden, caramelized sweet plantains fried to perfection", spicy: false },
        { id: 11, name: "Tostones", description: "Twice-fried crispy green plantains served with dipping sauce", spicy: false },
      ],
    },
    {
      id: "patties",
      name: "Patties",
      image: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 12, name: "Beef Patty", description: "Flaky golden pastry filled with well-seasoned ground beef, Caribbean style", spicy: false },
        { id: 13, name: "Chicken Patty", description: "Savory chicken filling in a buttery, flaky pastry shell", spicy: false },
        { id: 14, name: "Veggie Patty", description: "Hearty vegetable and legume filling in our signature pastry", spicy: false },
        { id: 15, name: "Patty Box (3)", description: "Mix and match any 3 patties of your choice — best value!", spicy: false },
      ],
    },
    {
      id: "combos",
      name: "Caribbean Combos",
      image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 16, name: "Island Combo", description: "Griot + Rice & Beans + Sweet Plantains — the classic island meal", spicy: false },
        { id: 17, name: "Caribbean Feast", description: "Jerk Chicken + Rice & Beans + Plantains + Patty", spicy: false },
        { id: 18, name: "Duo Combo", description: "Any 2 proteins with 2 sides of your choice", spicy: false },
        { id: 19, name: "Family Platter", description: "Large assorted Caribbean platter, serves 4–6 people generously", spicy: false },
      ],
    },
    {
      id: "drinks",
      name: "Drinks",
      image: "https://images.pexels.com/photos/3987008/pexels-photo-3987008.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 20, name: "Tropical Punch", description: "Refreshing island fruit blend with mango, passionfruit, and citrus", spicy: false },
        { id: 21, name: "Coconut Water", description: "Fresh chilled coconut water, straight from the island", spicy: false },
        { id: 22, name: "Ginger Beer", description: "Spiced ginger brew, island style — bold and refreshing", spicy: false },
        { id: 23, name: "Soft Drinks", description: "Coke, Sprite, Fanta, Juice, Water", spicy: false },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 24, name: "Pain Patate", description: "Haitian sweet potato pudding with cinnamon, cloves, and warming spices", spicy: false },
        { id: 25, name: "Coconut Pudding", description: "Creamy, silky Caribbean coconut dessert served chilled", spicy: false },
        { id: 26, name: "Tropical Fruit Plate", description: "Seasonal selection of fresh tropical fruits, beautifully presented", spicy: false },
      ],
    },
  ],
  fr: [
    {
      id: "griot",
      name: "Griot",
      image: "https://images.pexels.com/photos/9609848/pexels-photo-9609848.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 1, name: "Griot Classique", description: "Porc haïtien traditionnel mariné, braisé aux agrumes et frit jusqu'à la perfection dorée", spicy: false },
        { id: 2, name: "Assiette Griot", description: "Griot classique avec riz aux haricots et bananes plantains sucrées", spicy: false },
        { id: 3, name: "Griot avec Pikliz", description: "Notre griot signature accompagné de légumes marinés au habanero pour plus de chaleur", spicy: true },
      ],
    },
    {
      id: "jerk",
      name: "Jerk Chicken",
      image: "https://images.pexels.com/photos/27556985/pexels-photo-27556985.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 4, name: "Assiette Jerk Chicken", description: "Demi-poulet mariné dans des épices insulaires, grillé, servi avec riz au coco", spicy: true },
        { id: 5, name: "Lanières Jerk Chicken", description: "Lanières tendres de poulet jerk, parfaites pour partager", spicy: true },
        { id: 6, name: "Combo Jerk Chicken", description: "Jerk chicken avec riz aux haricots, plantains et sauce signature", spicy: true },
      ],
    },
    {
      id: "rice",
      name: "Riz & Haricots",
      image: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 7, name: "Riz & Haricots au Coco", description: "Riz crémeux au coco avec haricots rouges et assaisonnement créole", spicy: false },
        { id: 8, name: "Riz Djon Djon", description: "Riz aux champignons noirs — une spécialité haïtienne bien-aimée", spicy: false },
        { id: 9, name: "Bol de Riz", description: "Riz aux haricots garni de griot ou de jerk chicken au choix", spicy: false },
      ],
    },
    {
      id: "plantains",
      name: "Bananes Plantains",
      image: "https://images.pexels.com/photos/27556971/pexels-photo-27556971.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 10, name: "Plantains Sucrées (Maduros)", description: "Bananes plantains sucrées et caramélisées, frites à la perfection dorée", spicy: false },
        { id: 11, name: "Tostones", description: "Plantains verts croustillants frits deux fois, servis avec sauce dipping", spicy: false },
      ],
    },
    {
      id: "patties",
      name: "Patties",
      image: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 12, name: "Patty au Boeuf", description: "Pâtisserie feuilletée dorée garnie de boeuf haché bien assaisonné", spicy: false },
        { id: 13, name: "Patty au Poulet", description: "Garniture de poulet savoureuse dans une pâte feuilletée beurrée", spicy: false },
        { id: 14, name: "Patty Végétarien", description: "Garniture copieuse aux légumes et légumineuses dans notre pâte signature", spicy: false },
        { id: 15, name: "Boîte de Patties (3)", description: "Mélangez et assortissez 3 patties de votre choix — meilleure valeur!", spicy: false },
      ],
    },
    {
      id: "combos",
      name: "Combos Caribéens",
      image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 16, name: "Combo Insulaire", description: "Griot + Riz aux Haricots + Plantains Sucrées — le repas insulaire classique", spicy: false },
        { id: 17, name: "Festin Caribéen", description: "Jerk Chicken + Riz aux Haricots + Plantains + Patty", spicy: false },
        { id: 18, name: "Duo Combo", description: "2 protéines au choix avec 2 accompagnements au choix", spicy: false },
        { id: 19, name: "Plat Familial", description: "Grand plateau caribéen assorti, pour 4 à 6 personnes généreusement", spicy: false },
      ],
    },
    {
      id: "drinks",
      name: "Boissons",
      image: "https://images.pexels.com/photos/3987008/pexels-photo-3987008.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 20, name: "Punch Tropical", description: "Mélange rafraîchissant de fruits insulaires — mangue, maracudja et agrumes", spicy: false },
        { id: 21, name: "Eau de Coco", description: "Eau de coco fraîche et froide, directement de l'île", spicy: false },
        { id: 22, name: "Bière au Gingembre", description: "Bière de gingembre épicée, style insulaire — audacieuse et rafraîchissante", spicy: false },
        { id: 23, name: "Boissons Gazeuses", description: "Coke, Sprite, Fanta, Jus, Eau", spicy: false },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600",
      items: [
        { id: 24, name: "Pain Patate", description: "Pudding haïtien à la patate douce avec cannelle, clous de girofle et épices", spicy: false },
        { id: 25, name: "Pudding Coco", description: "Dessert caribéen crémeux et soyeux au coco, servi frais", spicy: false },
        { id: 26, name: "Assiette de Fruits Tropicaux", description: "Sélection saisonnière de fruits tropicaux frais, magnifiquement présentés", spicy: false },
      ],
    },
  ],
};

export default menuData;
