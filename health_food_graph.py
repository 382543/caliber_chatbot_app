#!/usr/bin/env python
"""
Health Food Graph - Visualize which foods are beneficial for different health conditions
"""

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from matplotlib.patches import Rectangle
import pandas as pd

# Define foods and their health benefits
health_food_data = {
    # Vegetables
    'Spinach': ['PCOD', 'Anemia', 'Heart', 'Diabetes', 'Immunity'],
    'Broccoli': ['Cancer', 'Heart', 'Immunity', 'Bones', 'Digestion'],
    'Carrot': ['Vision', 'Skin', 'Immunity', 'Heart', 'Digestion'],
    'Tomato': ['Heart', 'Skin', 'Cancer', 'Vision', 'Immunity'],
    'Beetroot': ['Blood Pressure', 'Anemia', 'Heart', 'Stamina', 'Liver'],
    
    # Fruits
    'Apple': ['Heart', 'Digestion', 'Weight Loss', 'Diabetes', 'Immunity'],
    'Banana': ['Energy', 'Digestion', 'Heart', 'Mood', 'Muscle'],
    'Orange': ['Immunity', 'Skin', 'Heart', 'Digestion', 'Vision'],
    'Papaya': ['Digestion', 'Skin', 'Immunity', 'Heart', 'Vision'],
    'Berries': ['Brain', 'Heart', 'Cancer', 'Immunity', 'Skin'],
    
    # Grains
    'Brown Rice': ['Diabetes', 'Heart', 'Digestion', 'Energy', 'Weight Loss'],
    'Oats': ['Heart', 'Diabetes', 'Weight Loss', 'Digestion', 'Cholesterol'],
    'Quinoa': ['Protein', 'Diabetes', 'Heart', 'Bones', 'Energy'],
    'Millets': ['Diabetes', 'Heart', 'PCOD', 'Weight Loss', 'Digestion'],
    
    # Proteins
    'Eggs': ['Muscle', 'Brain', 'Vision', 'Protein', 'Energy'],
    'Fish': ['Heart', 'Brain', 'Joints', 'Mood', 'Protein'],
    'Chicken': ['Muscle', 'Protein', 'Bones', 'Energy', 'Immunity'],
    'Legumes': ['Protein', 'Heart', 'Diabetes', 'Digestion', 'Energy'],
    
    # Dairy
    'Milk': ['Bones', 'Protein', 'Energy', 'Sleep', 'Muscle'],
    'Yogurt': ['Gut Health', 'Immunity', 'Bones', 'PCOD', 'Digestion'],
    'Paneer': ['Protein', 'Bones', 'Muscle', 'Teeth', 'Energy'],
    
    # Nuts & Seeds
    'Almonds': ['Brain', 'Heart', 'Skin', 'Diabetes', 'Bones'],
    'Walnuts': ['Brain', 'Heart', 'Mood', 'Sleep', 'Skin'],
    'Chia Seeds': ['Heart', 'Bones', 'Digestion', 'Energy', 'Weight Loss'],
}

# All unique health conditions
health_conditions = sorted(list(set([condition for foods in health_food_data.values() for condition in foods])))

# Create matrix
foods = list(health_food_data.keys())
matrix = np.zeros((len(foods), len(health_conditions)))

for i, food in enumerate(foods):
    for condition in health_food_data[food]:
        j = health_conditions.index(condition)
        matrix[i][j] = 1

# Create beautiful heatmap
plt.figure(figsize=(16, 12))
sns.set_style("whitegrid")

# Create heatmap with custom colors
ax = sns.heatmap(
    matrix, 
    cmap=['#f0f0f0', '#4ade80'],  # Light gray for 0, green for 1
    cbar=False,
    linewidths=1,
    linecolor='white',
    square=False,
    xticklabels=health_conditions,
    yticklabels=foods,
    annot=False
)

# Styling
plt.title('Food-Health Benefits Matrix\nWhich Foods Help Which Health Conditions', 
          fontsize=20, fontweight='bold', pad=20, color='#1e293b')
plt.xlabel('Health Conditions', fontsize=14, fontweight='bold', color='#475569')
plt.ylabel('Foods', fontsize=14, fontweight='bold', color='#475569')

# Rotate labels
plt.xticks(rotation=45, ha='right', fontsize=11)
plt.yticks(rotation=0, fontsize=11)

# Add grid
ax.set_facecolor('#f8fafc')

# Add legend
legend_elements = [
    Rectangle((0, 0), 1, 1, fc='#4ade80', label='Beneficial'),
    Rectangle((0, 0), 1, 1, fc='#f0f0f0', label='Not Listed')
]
plt.legend(handles=legend_elements, loc='upper left', bbox_to_anchor=(1.05, 1), 
          fontsize=11, frameon=True, shadow=True)

plt.tight_layout()
plt.savefig('health_food_matrix.png', dpi=300, bbox_inches='tight')
print("✓ Saved: health_food_matrix.png")

# Create bar chart showing most beneficial foods
plt.figure(figsize=(14, 8))
food_benefits = {food: len(benefits) for food, benefits in health_food_data.items()}
sorted_foods = sorted(food_benefits.items(), key=lambda x: x[1], reverse=True)

foods_sorted = [f[0] for f in sorted_foods]
counts = [f[1] for f in sorted_foods]

colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(foods_sorted)))
bars = plt.barh(foods_sorted, counts, color=colors, edgecolor='white', linewidth=1.5)

# Add value labels
for i, (bar, count) in enumerate(zip(bars, counts)):
    plt.text(count + 0.1, i, f'{count} conditions', 
            va='center', fontsize=10, fontweight='bold')

plt.title('Most Beneficial Foods by Number of Health Conditions', 
         fontsize=18, fontweight='bold', pad=20, color='#1e293b')
plt.xlabel('Number of Health Conditions Supported', fontsize=12, fontweight='bold')
plt.ylabel('Foods', fontsize=12, fontweight='bold')
plt.grid(axis='x', alpha=0.3, linestyle='--')
plt.tight_layout()
plt.savefig('foods_by_benefits.png', dpi=300, bbox_inches='tight')
print("✓ Saved: foods_by_benefits.png")

# Create condition-focused view
plt.figure(figsize=(14, 10))
condition_foods = {}
for food, conditions in health_food_data.items():
    for condition in conditions:
        if condition not in condition_foods:
            condition_foods[condition] = []
        condition_foods[condition].append(food)

sorted_conditions = sorted(condition_foods.items(), key=lambda x: len(x[1]), reverse=True)
conditions_list = [c[0] for c in sorted_conditions[:15]]  # Top 15
food_counts = [len(c[1]) for c in sorted_conditions[:15]]

colors = plt.cm.plasma(np.linspace(0.2, 0.9, len(conditions_list)))
bars = plt.barh(conditions_list, food_counts, color=colors, edgecolor='white', linewidth=1.5)

for i, (bar, count) in enumerate(zip(bars, food_counts)):
    plt.text(count + 0.2, i, f'{count} foods', 
            va='center', fontsize=10, fontweight='bold')

plt.title('Top Health Conditions with Most Beneficial Foods', 
         fontsize=18, fontweight='bold', pad=20, color='#1e293b')
plt.xlabel('Number of Beneficial Foods', fontsize=12, fontweight='bold')
plt.ylabel('Health Conditions', fontsize=12, fontweight='bold')
plt.grid(axis='x', alpha=0.3, linestyle='--')
plt.tight_layout()
plt.savefig('conditions_by_foods.png', dpi=300, bbox_inches='tight')
print("✓ Saved: conditions_by_foods.png")

# Create network-style circular visualization
from matplotlib.patches import Circle
import matplotlib.patches as mpatches

fig, ax = plt.subplots(figsize=(16, 16))

# Position health conditions in outer circle
n_conditions = len(health_conditions)
condition_angles = np.linspace(0, 2*np.pi, n_conditions, endpoint=False)
condition_radius = 8

condition_positions = {}
for i, condition in enumerate(health_conditions):
    x = condition_radius * np.cos(condition_angles[i])
    y = condition_radius * np.sin(condition_angles[i])
    condition_positions[condition] = (x, y)
    
    # Draw condition node
    circle = Circle((x, y), 0.4, color='#3b82f6', alpha=0.7, zorder=3)
    ax.add_patch(circle)
    
    # Add label
    label_x = (condition_radius + 1.2) * np.cos(condition_angles[i])
    label_y = (condition_radius + 1.2) * np.sin(condition_angles[i])
    ax.text(label_x, label_y, condition, fontsize=9, ha='center', va='center',
           fontweight='bold', bbox=dict(boxstyle='round,pad=0.3', 
           facecolor='white', edgecolor='#3b82f6', alpha=0.8))

# Position foods in inner circle
n_foods = len(foods)
food_angles = np.linspace(0, 2*np.pi, n_foods, endpoint=False)
food_radius = 4

food_positions = {}
for i, food in enumerate(foods):
    x = food_radius * np.cos(food_angles[i])
    y = food_radius * np.sin(food_angles[i])
    food_positions[food] = (x, y)
    
    # Draw food node
    circle = Circle((x, y), 0.5, color='#22c55e', alpha=0.8, zorder=3)
    ax.add_patch(circle)
    
    # Add label
    ax.text(x, y, food, fontsize=8, ha='center', va='center',
           fontweight='bold', color='white', zorder=4)

# Draw connections
for food, conditions in health_food_data.items():
    fx, fy = food_positions[food]
    for condition in conditions:
        cx, cy = condition_positions[condition]
        ax.plot([fx, cx], [fy, cy], 'gray', alpha=0.1, linewidth=0.5, zorder=1)

ax.set_xlim(-11, 11)
ax.set_ylim(-11, 11)
ax.set_aspect('equal')
ax.axis('off')

plt.title('Food-Health Connection Network\nGreen=Foods, Blue=Health Conditions', 
         fontsize=20, fontweight='bold', pad=30, color='#1e293b')

# Add legend
legend_elements = [
    mpatches.Patch(color='#22c55e', label='Foods (Inner Circle)'),
    mpatches.Patch(color='#3b82f6', label='Health Conditions (Outer Circle)'),
    mpatches.Patch(color='gray', alpha=0.3, label='Beneficial Connection')
]
plt.legend(handles=legend_elements, loc='upper right', fontsize=12, frameon=True)

plt.tight_layout()
plt.savefig('food_health_network.png', dpi=300, bbox_inches='tight')
print("✓ Saved: food_health_network.png")

# Create summary table
print("\n" + "="*80)
print("FOOD-HEALTH BENEFITS SUMMARY")
print("="*80)

df = pd.DataFrame([
    {'Food': food, 'Health Benefits': ', '.join(benefits), 'Count': len(benefits)}
    for food, benefits in health_food_data.items()
]).sort_values('Count', ascending=False)

print(df.to_string(index=False))

print("\n" + "="*80)
print(f"✓ Generated 4 visualizations!")
print("  1. health_food_matrix.png - Heatmap of all foods vs health conditions")
print("  2. foods_by_benefits.png - Most beneficial foods ranked")
print("  3. conditions_by_foods.png - Health conditions with most food support")
print("  4. food_health_network.png - Network visualization of connections")
print("="*80)
