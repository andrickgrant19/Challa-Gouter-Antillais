// Restaurant Configuration
// Import this file to get restaurant details throughout the app

export const restaurantConfig = {
  name: "Chala Le Gouter Antillais",
  tagline: "Saveurs Caribéennes Authentiques à Montréal",
  logo: null,
  primaryColor: "#D84315",
  secondaryColor: "#D4AF37",
  address: "11866 Bd Rivière-des-Prairies, Montréal, QC H1C 1P9",
  phone: "(514) 588-3708",
  email: "contact@chalalegouter.com",
  uberEatsUrl: "https://www.ubereats.com/ca-fr/store/chala-le-gouter-antillais/5PogqSjLWTKTUIYfVPvYPw",
  hours: {
    monday:    "11:00 AM – 7:00 PM",
    tuesday:   "11:00 AM – 8:00 PM",
    wednesday: "11:00 AM – 9:00 PM",
    thursday:  "11:00 AM – 9:00 PM",
    friday:    "11:00 AM – 9:00 PM",
    saturday:  "11:00 AM – 8:00 PM",
    sunday:    "12:00 PM – 7:00 PM",
  },
  social: {
    instagram: "",
    facebook:  "",
  },
  stripePublishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "",
  estimatedPickupTime: "20–30 minutes",
  estimatedDeliveryTime: "40–55 minutes",
  taxRate: 0.14975,
  currency: "cad",
  currencySymbol: "$",
};
