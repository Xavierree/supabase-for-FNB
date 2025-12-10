# SolarChicken & GyuGalaxy Cloud System

This branch contains the implementation for **SolarChick** (Toko A) and **GyuGalaxy** (Toko B) distributed cloud nodes.

## Prerequisites

### Python Environment
1.  **Navigate to the root directory.**
2.  **Create and activate a virtual environment** (recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies**:
    ```bash
    pip install supabase python-dotenv
    ```
4.  **Environment Variables**: Create a `.env` file in the root directory with the following keys:
    - `SUPABASE_URL_A` (For SolarChicken / Toko A)
    - `SUPABASE_KEY_A`
    - `SUPABASE_URL_B` (For GyuGalaxy / Toko B)
    - `SUPABASE_KEY_B`

### Next.js Dashboard
1.  **Navigate to the dashboard directory**:
    ```bash
    cd master-dashboard
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```

---

## Running the Application

### 1. Data Seeding
Initialize the transaction data for both stores. This ensures the databases have the correct menu items and categories.

- **Seed SolarChicken (Toko A)**:
  ```bash
  python seed_data_solar.py
  ```

- **Seed GyuGalaxy (Toko B)**:
  ```bash
  python seed_data_gyu.py
  ```

### 2. Store Nodes (Cloud Nodes)
Run the independent store nodes. These scripts listen for aggregate commands from the master dashboard and perform local computations.

- **Run SolarChicken Node**:
  ```bash
  python store_node_solar.py
  ```

- **Run GyuGalaxy Node**:
  ```bash
  python store_node_gyu.py
  ```

### 3. Master Dashboard
The dashboard sends commands to the store nodes and visualizes the results.

1.  Navigate to `master-dashboard`:
    ```bash
    cd master-dashboard
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser.
