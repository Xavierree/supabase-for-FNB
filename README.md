# Supabase FNB Cloud System

## Prerequisites

### Python Environment
1.  Navigate to the root directory.
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install supabase python-dotenv
    ```
4.  **Environment Variables**: Ensure you have a `.env` file in the root directory with the following keys:
    - `SUPABASE_URL_A`
    - `SUPABASE_KEY_A`
    - `SUPABASE_URL_B`
    - `SUPABASE_KEY_B`

### Next.js Dashboard
1.  Navigate to the `master-dashboard` directory:
    ```bash
    cd master-dashboard
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Application

### Python Components

#### Store Nodes
Run the store nodes to listen for commands and process transactions:

- **Store Node A**:
  ```bash
  python store_node_a.py
  ```

- **Store Node B**:
  ```bash
  python store_node_b.py
  ```

#### Data Seeding
Use these scripts to populate the databases with initial data:

- **Seed Token A**:
  ```bash
  python seed_data_a.py
  ```

- **Seed Token B**:
  ```bash
  python seed_data_b.py
  ```

### Dashboard
To start the Next.js development server:

1.  Navigate to `master-dashboard`:
    ```bash
    cd master-dashboard
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
