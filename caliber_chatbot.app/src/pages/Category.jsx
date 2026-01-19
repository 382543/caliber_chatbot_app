// src/pages/Category.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

const DATA = {
  vegetables: { 
    title: "Vegetables", 
    emoji: "🥦", 
    items: [
      { 
        name: "Spinach", 
        emoji: "🥬",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop",
        description: "Spinach is a nutrient powerhouse rich in iron, calcium, vitamins A, C, and K. Perfect for PCOD management as it helps reduce inflammation and supports hormonal balance.",
        benefits: ["High in iron - prevents anemia", "Low glycemic index", "Rich in antioxidants", "Supports bone health", "Anti-inflammatory properties"],
        howToEat: ["Add to smoothies", "Sauté with garlic", "Mix in dal or curry", "Make palak paneer"],
        pcod: "Excellent for PCOD - helps regulate insulin levels and reduces inflammation."
      },
      { 
        name: "Broccoli", 
        emoji: "🥦",
        image: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400&h=300&fit=crop",
        description: "Broccoli is a cruciferous vegetable packed with vitamins C and K, fiber, and powerful antioxidants. It's excellent for detoxification and hormone balance.",
        benefits: ["Supports liver detoxification", "High in fiber", "Rich in vitamin C", "Anti-cancer properties", "Helps hormonal balance"],
        howToEat: ["Steam lightly", "Roast with olive oil", "Add to stir-fries", "Blend into soups"],
        pcod: "Great for PCOD - supports estrogen metabolism and reduces inflammation."
      },
      { 
        name: "Carrot", 
        emoji: "🥕",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop",
        description: "Carrots are rich in beta-carotene, fiber, and antioxidants. They support eye health, skin health, and digestive wellness.",
        benefits: ["Excellent for eye health", "High in beta-carotene", "Good fiber source", "Supports skin health", "Boosts immunity"],
        howToEat: ["Eat raw as snacks", "Add to salads", "Make carrot juice", "Cook in curries"],
        pcod: "Good for PCOD - low GI and helps with insulin sensitivity."
      },
      { 
        name: "Cucumber", 
        emoji: "🥒",
        image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&h=300&fit=crop",
        description: "Cucumber is 95% water, making it extremely hydrating. It's low in calories and helps with weight management and skin health.",
        benefits: ["Very hydrating", "Low in calories", "Supports weight loss", "Good for skin", "Anti-inflammatory"],
        howToEat: ["Eat raw in salads", "Make cucumber water", "Add to raita", "Juice with mint"],
        pcod: "Perfect for PCOD - low calorie, hydrating, and helps weight management."
      },
      { 
        name: "Tomato", 
        emoji: "🍅",
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop",
        description: "Tomatoes are rich in lycopene, a powerful antioxidant. They support heart health and have anti-cancer properties.",
        benefits: ["High in lycopene", "Heart healthy", "Rich in vitamin C", "Anti-cancer properties", "Supports skin health"],
        howToEat: ["Add to salads", "Make tomato soup", "Use in curries", "Eat raw with salt"],
        pcod: "Good for PCOD - rich in antioxidants and supports overall health."
      }
    ],
    tips: ["Aim 2–3 cups/day.", "Mix colors (green, orange, purple).", "Steam or sauté with minimal oil."]
  },
  fruits: { 
    title: "Fruits", 
    emoji: "🍎", 
    items: [
      { 
        name: "Apple", 
        emoji: "🍎",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop",
        description: "Apples are packed with fiber and vitamin C. They help regulate blood sugar and support digestive health.",
        benefits: ["High in fiber", "Supports digestion", "Helps control blood sugar", "Rich in antioxidants", "Good for heart health"],
        howToEat: ["Eat with skin", "Add to oatmeal", "Make smoothies", "Slice as snacks"],
        pcod: "Great for PCOD - high fiber helps with insulin resistance."
      },
      { 
        name: "Banana", 
        emoji: "🍌",
        image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop",
        description: "Bananas are rich in potassium, vitamin B6, and provide quick energy. They support heart health and muscle function.",
        benefits: ["High in potassium", "Quick energy source", "Supports muscle function", "Good for digestion", "Mood booster"],
        howToEat: ["Eat as is", "Add to smoothies", "Mix with yogurt", "Pre-workout snack"],
        pcod: "Moderate for PCOD - eat in moderation due to higher natural sugars."
      },
      { 
        name: "Orange", 
        emoji: "🍊",
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop",
        description: "Oranges are excellent sources of vitamin C and fiber. They boost immunity and support skin health.",
        benefits: ["Very high in vitamin C", "Boosts immunity", "Supports skin health", "High in fiber", "Anti-inflammatory"],
        howToEat: ["Eat fresh segments", "Make fresh juice", "Add to salads", "Eat whole fruit"],
        pcod: "Good for PCOD - high in vitamin C and fiber."
      },
      { 
        name: "Berries", 
        emoji: "🫐",
        image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop",
        description: "Berries (blueberries, strawberries, raspberries) are antioxidant powerhouses with low glycemic index.",
        benefits: ["Highest antioxidants", "Low glycemic index", "Anti-inflammatory", "Brain health", "Heart healthy"],
        howToEat: ["Eat fresh", "Add to yogurt", "Blend in smoothies", "Top on oatmeal"],
        pcod: "Excellent for PCOD - low GI and packed with antioxidants."
      },
      { 
        name: "Guava", 
        emoji: "🍐",
        image: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&h=300&fit=crop",
        description: "Guava is rich in vitamin C, fiber, and has a low glycemic index. It's excellent for immunity and digestion.",
        benefits: ["Very high in vitamin C", "High fiber content", "Low glycemic index", "Supports digestion", "Boosts immunity"],
        howToEat: ["Eat with skin", "Sprinkle salt/chili", "Make juice", "Eat as snack"],
        pcod: "Excellent for PCOD - low GI and very high in fiber."
      }
    ],
    tips: ["1–2 servings/day.", "Prefer whole fruits over juice.", "Berries are lower-GI & antioxidant-rich."]
  },
  grains: { 
    title: "Grains", 
    emoji: "🌾", 
    items: [
      { 
        name: "Oats", 
        emoji: "🥣",
        image: "https://images.pexels.com/photos/3338497/pexels-photo-3338497.jpeg?w=400&h=300&fit=crop",
        description: "Oats are whole grains rich in soluble fiber (beta-glucan) that helps lower cholesterol and control blood sugar.",
        benefits: ["High in soluble fiber", "Lowers cholesterol", "Controls blood sugar", "Supports weight loss", "Long-lasting energy"],
        howToEat: ["Make oatmeal", "Add to smoothies", "Make oat flour", "Overnight oats"],
        pcod: "Excellent for PCOD - helps with insulin resistance and weight management."
      },
      { 
        name: "Brown Rice", 
        emoji: "🍚",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop",
        description: "Brown rice is a whole grain that retains bran and germ, making it more nutritious than white rice.",
        benefits: ["High in fiber", "Rich in minerals", "Supports digestion", "Better than white rice", "Sustained energy"],
        howToEat: ["Cook as main grain", "Make brown rice khichdi", "Use in pulao", "Mix with vegetables"],
        pcod: "Good for PCOD - better glycemic control than white rice."
      },
      { 
        name: "Quinoa", 
        emoji: "🌾",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80",
        description: "Quinoa is a complete protein containing all 9 essential amino acids. It's gluten-free and nutrient-dense.",
        benefits: ["Complete protein source", "Gluten-free", "High in fiber", "Rich in minerals", "Low glycemic index"],
        howToEat: ["Cook like rice", "Add to salads", "Make quinoa khichdi", "Use in breakfast bowls"],
        pcod: "Excellent for PCOD - high protein and low GI."
      },
      { 
        name: "Ragi (Finger Millet)", 
        emoji: "🌾",
        image: "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?w=400&h=300&fit=crop",
        description: "Ragi is an ancient Indian grain extremely high in calcium and iron. Perfect for bone health and anemia.",
        benefits: ["Very high in calcium", "Rich in iron", "High fiber content", "Low glycemic index", "Gluten-free"],
        howToEat: ["Make ragi roti", "Ragi porridge", "Ragi dosa", "Mix in flour"],
        pcod: "Excellent for PCOD - low GI and helps manage weight."
      },
      { 
        name: "Whole Wheat", 
        emoji: "🌾",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=300",
        description: "Whole wheat contains the entire grain kernel - bran, germ, and endosperm - providing more nutrients and fiber.",
        benefits: ["High in fiber", "Rich in B vitamins", "Supports digestion", "Better than refined flour", "Sustained energy"],
        howToEat: ["Make whole wheat roti", "Use in bread", "Make pasta", "Use in baking"],
        pcod: "Good for PCOD - better than refined flour, but watch portions."
      }
    ],
    tips: ["Choose whole grains.", "Watch portion (½ plate max).", "For PCOD: add millets 3–4×/week."]
  },
  proteins: { 
    title: "Proteins", 
    emoji: "🥚", 
    items: [
      { 
        name: "Eggs", 
        emoji: "🥚",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop",
        description: "Eggs are complete protein sources with all essential amino acids. They're rich in vitamins D, B12, and choline.",
        benefits: ["Complete protein", "Rich in vitamin D", "Brain health (choline)", "Supports muscle building", "Very satiating"],
        howToEat: ["Boiled eggs", "Scrambled", "Omelette with veggies", "Egg curry"],
        pcod: "Excellent for PCOD - high protein helps with satiety and hormonal balance."
      },
      { 
        name: "Dal (Lentils)", 
        emoji: "🫘",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop",
        description: "Dal is a staple Indian protein source rich in protein, fiber, iron, and folate. It's affordable and versatile.",
        benefits: ["High in plant protein", "Rich in fiber", "Good iron source", "Budget-friendly", "Supports digestion"],
        howToEat: ["Make dal tadka", "Dal soup", "Mix with rice", "Make dal chilla"],
        pcod: "Excellent for PCOD - high protein and fiber, low GI."
      },
      { 
        name: "Chickpeas", 
        emoji: "🫘",
        image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop",
        description: "Chickpeas (chana) are protein and fiber powerhouses. They help control blood sugar and support weight management.",
        benefits: ["High in protein & fiber", "Controls blood sugar", "Supports weight loss", "Rich in minerals", "Very filling"],
        howToEat: ["Boiled chana salad", "Chana curry", "Hummus", "Roasted snack"],
        pcod: "Excellent for PCOD - high fiber and protein, low GI."
      },
      { 
        name: "Paneer", 
        emoji: "🧀",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
        description: "Paneer is Indian cottage cheese, rich in protein and calcium. It's a vegetarian protein favorite.",
        benefits: ["High in protein", "Rich in calcium", "Supports bone health", "Good for muscles", "Versatile ingredient"],
        howToEat: ["Paneer curry", "Grilled paneer", "Paneer tikka", "Add to salads"],
        pcod: "Good for PCOD - high protein, but watch portion due to fat content."
      },
      { 
        name: "Chicken (Lean)", 
        emoji: "🍗",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop",
        description: "Lean chicken breast is a high-quality protein source with low fat. It supports muscle building and weight management.",
        benefits: ["Very high in protein", "Low in fat", "Rich in B vitamins", "Supports muscle growth", "Versatile"],
        howToEat: ["Grilled chicken", "Chicken curry", "Chicken soup", "Stir-fried"],
        pcod: "Excellent for PCOD - high protein, low fat, helps with satiety."
      }
    ],
    tips: ["Include protein every meal.", "Mix plant & animal sources.", "Supports satiety & muscle repair."]
  },
  dairy: { 
    title: "Dairy", 
    emoji: "🥛", 
    items: [
      { 
        name: "Milk", 
        emoji: "🥛",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop",
        description: "Milk is a complete food rich in calcium, protein, vitamin D, and other essential nutrients.",
        benefits: ["High in calcium", "Good protein source", "Rich in vitamin D", "Supports bone health", "Versatile ingredient"],
        howToEat: ["Drink plain", "Add to tea/coffee", "Make smoothies", "Use in cooking"],
        pcod: "Moderate for PCOD - prefer low-fat milk, some may be lactose intolerant."
      },
      { 
        name: "Curd/Yogurt", 
        emoji: "🥣",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
        description: "Curd is fermented milk rich in probiotics, calcium, and protein. It supports gut health and digestion.",
        benefits: ["Rich in probiotics", "Supports gut health", "High in calcium", "Aids digestion", "Boosts immunity"],
        howToEat: ["Eat plain", "Make raita", "Add to smoothies", "Use in marinades"],
        pcod: "Excellent for PCOD - probiotics support gut health and hormonal balance."
      },
      { 
        name: "Paneer", 
        emoji: "🧀",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
        description: "Paneer is fresh cheese made from milk, rich in protein and calcium. It's a vegetarian protein staple.",
        benefits: ["High in protein", "Rich in calcium", "Supports bone health", "Good for muscles", "Low-carb option"],
        howToEat: ["Paneer curry", "Grilled paneer", "Paneer bhurji", "Add to wraps"],
        pcod: "Good for PCOD - high protein, but watch portions."
      },
      { 
        name: "Buttermilk", 
        emoji: "🥛",
        image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",
        description: "Buttermilk (chaas) is a refreshing probiotic drink that aids digestion and keeps you hydrated.",
        benefits: ["Rich in probiotics", "Very hydrating", "Aids digestion", "Low in calories", "Cooling effect"],
        howToEat: ["Drink plain", "Add spices (cumin, ginger)", "After meals", "Summer cooler"],
        pcod: "Excellent for PCOD - low calorie, probiotic-rich, aids digestion."
      }
    ],
    tips: ["Prefer low-fat if needed.", "Curd supports gut health.", "If lactose-intolerant: curd/lactose-free."]
  },
  junk: { 
    title: "Junk / Ultra-processed", 
    emoji: "🍔", 
    items: [
      { 
        name: "Chips", 
        emoji: "🍟",
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop",
        description: "Chips are ultra-processed, high in unhealthy fats, salt, and calories. They provide empty calories with no nutrients.",
        harms: ["Very high in calories", "Loaded with unhealthy fats", "High sodium content", "No nutritional value", "Addictive"],
        alternatives: ["Roasted makhana", "Air-popped popcorn", "Roasted chickpeas", "Vegetable sticks"],
        pcod: "Very bad for PCOD - high in unhealthy fats and empty calories."
      },
      { 
        name: "Sodas", 
        emoji: "🥤",
        image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop",
        description: "Sodas are sugar-loaded drinks that spike blood sugar and provide zero nutrition. They increase diabetes and obesity risk.",
        harms: ["Very high in sugar", "Empty calories", "Spikes blood sugar", "Damages teeth", "Increases obesity risk"],
        alternatives: ["Plain water", "Lemon water", "Coconut water", "Herbal tea"],
        pcod: "Terrible for PCOD - high sugar content worsens insulin resistance."
      },
      { 
        name: "Pastries", 
        emoji: "🧁",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
        description: "Pastries are made with refined flour, sugar, and unhealthy fats (trans fats). They spike blood sugar rapidly.",
        harms: ["High in refined sugar", "Made with refined flour", "Trans fats", "Spikes blood sugar", "Weight gain"],
        alternatives: ["Homemade whole wheat cookies", "Fruit with yogurt", "Dates", "Homemade laddoos"],
        pcod: "Very bad for PCOD - refined carbs and sugar worsen hormonal imbalance."
      },
      { 
        name: "Fried Fast Food", 
        emoji: "🍔",
        image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop",
        description: "Deep-fried fast food is extremely high in unhealthy fats, calories, and sodium. It increases heart disease risk.",
        harms: ["Very high in calories", "Unhealthy trans fats", "High sodium", "Increases cholesterol", "Heart disease risk"],
        alternatives: ["Grilled chicken", "Homemade burgers", "Baked fries", "Wraps with veggies"],
        pcod: "Terrible for PCOD - high in unhealthy fats and contributes to weight gain."
      }
    ],
    tips: ["⚠️ Avoid completely for best health.", "❌ Not recommended for PCOD/weight management.", "🚫 High in unhealthy fats, sugar, and empty calories."]
  },
};

export default function Category() {
  const { slug } = useParams();
  const [selectedItem, setSelectedItem] = useState(null);
  const info = DATA[slug];
  
  if (!info) {
    return (
      <div className="page">
        <h2>Category not found</h2>
        <p><Link to="/lifestyle" className="link">← Back to Lifestyle</Link></p>
      </div>
    );
  }

  // If an item is selected, show detailed view
  if (selectedItem) {
    const isJunk = slug === 'junk';
    return (
      <div className="page">
        <button 
          onClick={() => setSelectedItem(null)} 
          className="link" 
          style={{marginBottom: 24}}
        >
          ← Back to {info.title}
        </button>
        
        {/* Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '2px solid #e2e8f0',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '100%',
            height: 280,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img 
              src={selectedItem.image} 
              alt={selectedItem.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              padding: '60px 32px 24px',
              color: 'white'
            }}>
              <h2 style={{
                fontSize: 36,
                fontWeight: 800,
                margin: 0,
                color: 'white',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {selectedItem.name}
              </h2>
            </div>
          </div>
          <div style={{
            padding: 32,
            textAlign: 'center'
          }}>
            <p style={{
              color: '#64748b',
              fontSize: 17,
              lineHeight: 1.6,
              maxWidth: 600,
              margin: '0 auto'
            }}>
              {selectedItem.description}
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        {selectedItem.benefits && (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #86efac',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#166534',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{fontSize: 24}}>✨</span> Health Benefits
            </h3>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {selectedItem.benefits.map((b, i) => (
                <li key={i} style={{
                  padding: '10px 16px',
                  margin: '8px 0',
                  background: 'white',
                  borderRadius: 10,
                  fontSize: 15,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <span style={{fontSize: 18, flexShrink: 0, marginTop: 2}}>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Harms Section */}
        {selectedItem.harms && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '2px solid #fca5a5',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#991b1b',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{fontSize: 24}}>⚠️</span> Health Risks
            </h3>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {selectedItem.harms.map((h, i) => (
                <li key={i} style={{
                  padding: '10px 16px',
                  margin: '8px 0',
                  background: 'white',
                  borderRadius: 10,
                  fontSize: 15,
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <span style={{fontSize: 18, flexShrink: 0, marginTop: 2}}>✕</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How to Eat Section */}
        {selectedItem.howToEat && (
          <div style={{
            background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
            border: '2px solid #fde047',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#854d0e',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{fontSize: 24}}>🍽️</span> How to Eat
            </h3>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {selectedItem.howToEat.map((h, i) => (
                <li key={i} style={{
                  padding: '10px 16px',
                  margin: '8px 0',
                  background: 'white',
                  borderRadius: 10,
                  fontSize: 15,
                  color: '#854d0e',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <span style={{fontSize: 18, flexShrink: 0, marginTop: 2}}>→</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternatives Section */}
        {selectedItem.alternatives && (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #86efac',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#166534',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{fontSize: 24}}>✅</span> Healthy Alternatives
            </h3>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {selectedItem.alternatives.map((a, i) => (
                <li key={i} style={{
                  padding: '10px 16px',
                  margin: '8px 0',
                  background: 'white',
                  borderRadius: 10,
                  fontSize: 15,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <span style={{fontSize: 18, flexShrink: 0, marginTop: 2}}>→</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PCOD Note */}
        {selectedItem.pcod && (
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '3px solid #3b82f6',
            borderRadius: 16,
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
            }}></div>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1e40af',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{fontSize: 24}}>💙</span> PCOD/PCOS Note
            </h3>
            <p style={{
              color: '#1e40af',
              margin: 0,
              fontSize: 15,
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              {selectedItem.pcod}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Category list view
  return (
    <div className="page">
      <div style={{marginBottom: 32}}>
        <Link to="/lifestyle" className="link" style={{marginBottom: 16, display: 'inline-flex'}}>
          ← Back to Lifestyle
        </Link>
        <div style={{marginTop: 16}}>
          <h2 style={{margin: 0, fontSize: 32, fontWeight: 800, color: '#0a58ca'}}>{info.title}</h2>
          <p style={{color: '#6b7280', margin: '8px 0 0 0', fontSize: 16}}>Click on any item to learn more</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
        marginBottom: 32,
        maxWidth: 900
      }}>
        {info.items.map((item, idx) => {
          const isJunk = slug === 'junk';
          return (
          <button
            key={item.name}
            onClick={() => setSelectedItem(item)}
            style={{
              background: isJunk ? '#fff5f5' : 'white',
              border: isJunk ? '2px solid #fca5a5' : '2px solid #e5e7eb',
              borderRadius: 16,
              padding: 0,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${idx * 0.05}s`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = isJunk ? '#ef4444' : '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = isJunk ? '0 12px 28px rgba(239, 68, 68, 0.15)' : '0 12px 28px rgba(59, 130, 246, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = isJunk ? '#fca5a5' : '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '100%',
              height: 140,
              overflow: 'hidden',
              borderRadius: '14px 14px 0 0',
              position: 'relative'
            }}>
              <img 
                src={item.image} 
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  filter: isJunk ? 'grayscale(20%) brightness(0.9)' : 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
              {isJunk && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: '#ef4444',
                  color: 'white',
                  fontSize: 18,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  ⚠
                </div>
              )}
            </div>
            <div style={{
              padding: 16,
              fontSize: 15,
              fontWeight: 600,
              color: isJunk ? '#991b1b' : '#1f2937',
              letterSpacing: '-0.01em'
            }}>
              {item.name}
            </div>
          </button>
        );
        })}
      </div>

      <div style={{
        background: slug === 'junk' ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: 16,
        padding: 24,
        border: slug === 'junk' ? '2px solid #fca5a5' : '1px solid #bae6fd'
      }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 700,
          color: slug === 'junk' ? '#991b1b' : '#0369a1',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {slug === 'junk' ? '⚠️ Health Warnings' : '💡 Quick Tips'}
        </h3>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {info.tips.map((t, i) => (
            <li key={i} style={{
              padding: '12px 16px',
              background: 'white',
              borderRadius: 10,
              fontSize: 14,
              color: slug === 'junk' ? '#991b1b' : '#334155',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontWeight: slug === 'junk' ? 600 : 400
            }}>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
