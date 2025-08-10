# Exam Outline

## Section 1: Databricks Tooling

### Explain how Delta Lake uses the transaction log and cloud object storage to guarantee atomicity and durability

Delta Lake guarantees atomicity and durability by combining a transaction log (the Delta log) with cloud object storage. Every write operation (such as insert, update, or delete) is recorded as an atomic transaction in the Delta log, which is stored as a series of JSON files in a special `_delta_log` directory. This log tracks all changes to the table, ensuring that either all changes from a transaction are committed or none are, providing atomicity. The actual data files (Parquet files) are stored in cloud object storage, which is highly durable and reliable. By separating the transaction log from the data files and leveraging the durability of cloud storage, Delta Lake ensures that committed data is never lost, even in the event of failures, thus guaranteeing durability.

szdhjd
### Describe basic functionality of Delta clone

Delta clone allows users to create a copy of a Delta table, either as a shallow or deep clone. A shallow clone creates a new table that references the same data files as the source table, making it fast and space-efficient. A deep clone copies both the metadata and the data files, creating a completely independent copy. Cloning is useful for testing, development, or backup scenarios.

### Apply common Delta Lake indexing optimizations including partitioning, zorder, bloom filters, and file sizes

- **Partitioning:** Divides data into distinct subsets based on column values, improving query performance by reducing the amount of data scanned.
- **Z-Order Clustering:** Reorders data files based on the values of one or more columns, optimizing data skipping for queries with filters on those columns.
- **Bloom Filters:** Probabilistic data structures that help quickly determine if a value might exist in a dataset, reducing unnecessary file scans.
- **File Sizes:** Optimizing file sizes (e.g., targeting 100-500 MB per file) helps balance parallelism and metadata overhead, improving read and write performance.

### Implement Delta tables optimized for Databricks SQL service

To optimize Delta tables for Databricks SQL, use appropriate partitioning, apply Z-Order clustering on frequently queried columns, and maintain optimal file sizes. Regularly run the `OPTIMIZE` and `VACUUM` commands to compact small files and remove obsolete data. Use Delta Lake features like data skipping and caching to further enhance query performance.

### Contrast different strategies for partitioning data (e.g. identify proper partitioning columns to use)

Partitioning strategies depend on query patterns and data distribution. Choose partition columns that are commonly used in filters and have high cardinality but avoid over-partitioning, which can lead to many small files. For example, partitioning by date is effective for time-series data, while partitioning by customer ID may be suitable for customer-centric queries. Analyze query workloads and data size to select the most effective partitioning scheme.