import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

# Load dataset
data = pd.read_csv("historical_data.csv")

# Clean column names
data.columns = data.columns.str.strip()

print("Columns:", data.columns)

predictions = []
accuracies = []

for index, row in data.iterrows():
    try:
        # Convert values
        feb = float(row['level_feb_2026'])
        mar = float(row['level_mar_2026'])
        apr = float(row['level_apr_2026'])
        population = float(row['population'])

        # Check missing
        if any(pd.isna([feb, mar, apr, population])):
            predictions.append(np.nan)
            accuracies.append(np.nan)
            continue

        # Features (time + population)
        X = [
            [1, population],
            [2, population],
            [3, population]
        ]

        y = [feb, mar, apr]

        # Train model
        model = LinearRegression()
        model.fit(X, y)

        # Accuracy (R² score)
        acc = model.score(X, y)

        # Predict next month (May)
        pred = model.predict([[4, population]])

        predictions.append(pred[0])
        accuracies.append(acc)

    except Exception as e:
        print(f"Error in row {index}: {e}")
        predictions.append(np.nan)
        accuracies.append(np.nan)

# Add columns
data['Predicted_May_2026'] = predictions
data['Accuracy'] = accuracies

# Save file
data.to_csv("predictions.csv", index=False)

print("✅ Done! predictions.csv updated")