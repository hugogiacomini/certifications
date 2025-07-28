# Data Modeling and Design for Databricks Data Engineer Professional

## Overview
This section covers the fundamental concepts of data modeling and design patterns within the Databricks platform, including data architecture design, schema evolution, and best practices for building scalable data systems.

## 1. Data Architecture Design Patterns

### 1.1 Medallion Architecture (Bronze, Silver, Gold)

The **Medallion Architecture** is Databricks' recommended multi-layered approach to data architecture that organizes data in three layers:

```mermaid
flowchart LR
    Sources[Data Sources<br/>Files, APIs, Databases] --> Bronze[(Bronze Layer<br/>Raw Data)]
    Bronze --> Silver[(Silver Layer<br/>Cleaned & Validated)]
    Silver --> Gold[(Gold Layer<br/>Business Ready)]
    
    Bronze --> |"Auto Loader<br/>Schema Evolution"| BronzeDetails["`**Bronze Characteristics:**
    • Raw data as-is
    • Schema on read
    • Data lineage preserved
    • Audit trail maintained`"]
    
    Silver --> |"Data Quality<br/>Transformations"| SilverDetails["`**Silver Characteristics:**
    • Cleaned & validated
    • Business rules applied
    • Deduplicated
    • Standardized schema`"]
    
    Gold --> |"Aggregations<br/>Business Logic"| GoldDetails["`**Gold Characteristics:**
    • Business-ready datasets
    • Aggregated metrics
    • Optimized for analytics
    • Materialized views`"]
    
    Gold --> Analytics[Analytics & ML<br/>Dashboards, Reports]
    
    classDef bronzeClass fill:#cd7f32,stroke:#8b5a2b,color:#fff
    classDef silverClass fill:#c0c0c0,stroke:#808080,color:#000
    classDef goldClass fill:#ffd700,stroke:#daa520,color:#000
    classDef sourceClass fill:#e6f3ff,stroke:#4d94ff,color:#000
    classDef analyticsClass fill:#f0f8ff,stroke:#87ceeb,color:#000
    
    class Bronze bronzeClass
    class Silver silverClass
    class Gold goldClass
    class Sources sourceClass
    class Analytics analyticsClass
```

#### Bronze Layer (Raw Data)
- **Purpose**: Ingests and stores raw data in its original format
- **Characteristics**:
  - Data is ingested as-is without transformation
  - Typically stored in formats like JSON, CSV, Parquet, or Avro
  - Preserves data lineage and enables data replay
  - Often includes metadata like ingestion timestamp

**Best Practices:**
- Use Auto Loader for incremental data ingestion
- Implement schema enforcement and evolution
- Store data in cloud storage (S3, ADLS, GCS)
- Use partition strategies for better performance

**Implementation Example:**
```python
# Auto Loader for Bronze layer ingestion
df = (spark.readStream
  .format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("cloudFiles.schemaLocation", "s3://bucket/schema-location")
  .load("s3://bucket/raw-data/"))
```

#### Silver Layer (Cleaned and Filtered)
- **Purpose**: Cleaned, validated, and deduplicated data
- **Characteristics**:
  - Data quality checks applied
  - Schema standardization
  - Business rule enforcement
  - Optimized for analytics workloads

**Best Practices:**
- Implement data quality checks using Delta Lake constraints
- Use merge operations for upserts
- Apply business logic transformations
- Optimize with Z-ORDER and VACUUM operations

#### Gold Layer (Business-Level Aggregates)
- **Purpose**: Curated datasets ready for analytics and ML
- **Characteristics**:
  - Aggregated and enriched data
  - Optimized for specific business use cases
  - Often denormalized for performance
  - Powers dashboards and reports

**Best Practices:**
- Create materialized views or tables
- Implement proper indexing strategies
- Use caching for frequently accessed data
- Document data definitions and business logic

**Reference**: [Databricks Medallion Architecture](https://docs.databricks.com/lakehouse/medallion.html)

### 1.2 Data Lakehouse Architecture

The **Data Lakehouse** combines the best of data lakes and data warehouses:

```mermaid
flowchart LR
    subgraph "Data Sources"
        Files[Files<br/>CSV, JSON, Parquet]
        Streams[Streaming Data<br/>Kafka, Kinesis]
        APIs[APIs & SaaS<br/>REST, GraphQL]
        DBs[Databases<br/>OLTP Systems]
    end
    
    subgraph "Lakehouse Platform"
        subgraph "Storage Layer"
            DeltaLake[Delta Lake<br/>ACID Transactions<br/>Time Travel]
        end
        
        subgraph "Governance Layer"
            Unity[Unity Catalog<br/>Metadata & Security]
        end
        
        subgraph "Compute Layer"
            Photon[Photon Engine<br/>Vectorized Queries]
            Spark[Apache Spark<br/>Distributed Processing]
        end
        
        subgraph "ML Layer"
            MLflow[MLflow<br/>ML Lifecycle]
        end
    end
    
    subgraph "Analytics & ML"
        BI[Business Intelligence<br/>Dashboards & Reports]
        DS[Data Science<br/>Notebooks & Models]
        RT[Real-time Analytics<br/>Streaming Queries]
    end
    
    Files --> DeltaLake
    Streams --> DeltaLake
    APIs --> DeltaLake
    DBs --> DeltaLake
    
    Unity -.-> DeltaLake
    Photon --> DeltaLake
    Spark --> DeltaLake
    MLflow --> DeltaLake
    
    DeltaLake --> BI
    DeltaLake --> DS
    DeltaLake --> RT
    
    classDef sourceClass fill:#e6f3ff,stroke:#4d94ff,color:#000
    classDef storageClass fill:#fff2e6,stroke:#ff8c1a,color:#000
    classDef governanceClass fill:#f0e6ff,stroke:#9966cc,color:#000
    classDef computeClass fill:#e6ffe6,stroke:#4dff4d,color:#000
    classDef mlClass fill:#ffe6f0,stroke:#ff4d94,color:#000
    classDef analyticsClass fill:#f0f8ff,stroke:#87ceeb,color:#000
    
    class Files,Streams,APIs,DBs sourceClass
    class DeltaLake storageClass
    class Unity governanceClass
    class Photon,Spark computeClass
    class MLflow mlClass
    class BI,DS,RT analyticsClass
```

#### Key Components:
- **Delta Lake**: Provides ACID transactions and schema enforcement
- **Unity Catalog**: Centralized governance and metadata management
- **Photon**: Vectorized query engine for accelerated analytics
- **MLflow**: End-to-end ML lifecycle management

#### Benefits:
- **Schema Enforcement**: Prevents bad data from corrupting your datasets
- **ACID Transactions**: Ensures data consistency across concurrent operations
- **Time Travel**: Query historical versions of your data
- **Unified Analytics**: Single platform for BI, data science, and ML

**Reference**: [Databricks Lakehouse Platform](https://docs.databricks.com/lakehouse/index.html)

## 2. Schema Design and Evolution

### 2.1 Schema Evolution Strategies

```mermaid
flowchart LR
    subgraph "Schema Evolution Approaches"
        Auto[Automatic Evolution<br/>mergeSchema = true]
        Manual[Manual Management<br/>ALTER TABLE commands]
        Hybrid[Hybrid Approach<br/>Controlled automation]
    end
    
    subgraph "Evolution Scenarios"
        AddCol[Add New Columns]
        ChangeType[Change Data Types]
        RenameCol[Rename Columns]
        DropCol[Drop Columns]
    end
    
    subgraph "Best Practices"
        Validation[Schema Validation<br/>Data quality checks]
        Versioning[Schema Versioning<br/>Track changes]
        Testing[Testing Strategy<br/>Validate compatibility]
        Documentation[Documentation<br/>Change log maintenance]
    end
    
    Auto --> AddCol
    Auto --> ChangeType
    Manual --> RenameCol
    Manual --> DropCol
    Hybrid --> Validation
    
    AddCol --> Validation
    ChangeType --> Testing
    RenameCol --> Documentation
    DropCol --> Versioning
    
    classDef evolutionClass fill:#e6f3ff,stroke:#4d94ff,color:#000
    classDef scenarioClass fill:#fff2e6,stroke:#ff8c1a,color:#000
    classDef practiceClass fill:#e6ffe6,stroke:#4dff4d,color:#000
    
    class Auto,Manual,Hybrid evolutionClass
    class AddCol,ChangeType,RenameCol,DropCol scenarioClass
    class Validation,Versioning,Testing,Documentation practiceClass
```

#### Automatic Schema Evolution
Delta Lake supports automatic schema evolution to handle new columns in streaming data:

```python
# Enable automatic schema evolution
df.write \
  .option("mergeSchema", "true") \
  .mode("append") \
  .saveAsTable("table_name")
```

#### Manual Schema Management
For more control over schema changes:

```python
# Add new column to existing table
spark.sql("ALTER TABLE table_name ADD COLUMN new_column STRING")

# Change column data type (when compatible)
spark.sql("ALTER TABLE table_name ALTER COLUMN column_name TYPE BIGINT")
```

### 2.2 Best Practices for Schema Design

#### Naming Conventions
- Use snake_case for column names
- Include meaningful prefixes for related columns
- Avoid reserved keywords
- Use descriptive names that reflect business meaning

#### Data Types
- Choose appropriate data types for efficiency
- Use DECIMAL for financial calculations
- Consider string length for VARCHAR fields
- Use TIMESTAMP for temporal data with timezone awareness

#### Partitioning Strategy
```python
# Partition by date for time-series data
df.write \
  .partitionBy("year", "month", "day") \
  .mode("overwrite") \
  .saveAsTable("partitioned_table")
```

**Reference**: [Delta Lake Schema Evolution](https://docs.delta.io/latest/delta-batch.html#schema-validation)

## 3. Data Modeling Techniques

### 3.1 Dimensional Modeling

```mermaid
flowchart LR
    subgraph "Star Schema"
        FactTable["`**Fact Table**
        • Metrics & KPIs
        • Foreign Keys
        • Additive measures
        • Large volume`"]
        
        DimCustomer["`**Customer Dimension**
        • Customer attributes
        • Slowly changing
        • Descriptive data`"]
        
        DimProduct["`**Product Dimension**
        • Product details
        • Categories
        • Hierarchies`"]
        
        DimTime["`**Time Dimension**
        • Date attributes
        • Calendar hierarchy
        • Fiscal periods`"]
        
        DimLocation["`**Location Dimension**
        • Geographic data
        • Regional hierarchy
        • Store details`"]
    end
    
    FactTable --> DimCustomer
    FactTable --> DimProduct
    FactTable --> DimTime
    FactTable --> DimLocation
    
    subgraph "Snowflake Schema"
        FactTable2[Fact Table]
        DimCustomer2[Customer Dimension]
        DimCity[City Dimension]
        DimState[State Dimension]
        DimCountry[Country Dimension]
        
        FactTable2 --> DimCustomer2
        DimCustomer2 --> DimCity
        DimCity --> DimState
        DimState --> DimCountry
    end
    
    classDef factClass fill:#ffd700,stroke:#daa520,color:#000
    classDef dimClass fill:#87ceeb,stroke:#4682b4,color:#000
    classDef snowflakeClass fill:#f0e6ff,stroke:#9966cc,color:#000
    
    class FactTable,FactTable2 factClass
    class DimCustomer,DimProduct,DimTime,DimLocation,DimCustomer2 dimClass
    class DimCity,DimState,DimCountry snowflakeClass
```

#### Star Schema
- **Fact Tables**: Contain measurable metrics and foreign keys
- **Dimension Tables**: Contain descriptive attributes
- **Benefits**: Simple joins, good query performance, intuitive structure

#### Snowflake Schema
- **Normalized dimension tables**: Reduces redundancy
- **Trade-offs**: More complex joins but better storage efficiency

### 3.2 Data Vault Modeling

For enterprise data warehouses requiring auditability and flexibility:

```mermaid
flowchart LR
    subgraph "Data Vault Components"
        subgraph "Hubs"
            HubCustomer["`**Hub Customer**
            • Customer_HK (Hash Key)
            • Customer_BK (Business Key)
            • Load_Date
            • Record_Source`"]
            
            HubProduct["`**Hub Product**
            • Product_HK
            • Product_BK
            • Load_Date
            • Record_Source`"]
        end
        
        subgraph "Links"
            LinkSales["`**Link Sales**
            • Sales_HK
            • Customer_HK (FK)
            • Product_HK (FK)
            • Load_Date
            • Record_Source`"]
        end
        
        subgraph "Satellites"
            SatCustomer["`**Sat Customer**
            • Customer_HK (FK)
            • Load_Date
            • End_Date
            • Customer_Name
            • Address
            • Phone`"]
            
            SatProduct["`**Sat Product**
            • Product_HK (FK)
            • Load_Date
            • End_Date
            • Product_Name
            • Category
            • Price`"]
            
            SatSales["`**Sat Sales**
            • Sales_HK (FK)
            • Load_Date
            • End_Date
            • Quantity
            • Revenue
            • Discount`"]
        end
    end
    
    HubCustomer --> LinkSales
    HubProduct --> LinkSales
    HubCustomer --> SatCustomer
    HubProduct --> SatProduct
    LinkSales --> SatSales
    
    classDef hubClass fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef linkClass fill:#FF9800,stroke:#F57C00,color:#fff
    classDef satClass fill:#2196F3,stroke:#1565C0,color:#fff
    
    class HubCustomer,HubProduct hubClass
    class LinkSales linkClass
    class SatCustomer,SatProduct,SatSales satClass
```

#### Core Components:
- **Hubs**: Unique business keys
- **Links**: Relationships between hubs
- **Satellites**: Descriptive attributes with history

#### Benefits:
- Highly flexible and scalable
- Supports agile development
- Maintains complete audit trail
- Handles changing business requirements

### 3.3 One Big Table (OBT) Approach

For analytical workloads in cloud-native environments:

#### Characteristics:
- Denormalized structure
- Optimized for analytical queries
- Leverages columnar storage benefits
- Simplifies data access for analysts

#### Implementation:
```python
# Create OBT with pre-calculated metrics
obt = (fact_table
  .join(dim_customer, "customer_id")
  .join(dim_product, "product_id")
  .join(dim_time, "date_id")
  .select(
    col("customer_id"),
    col("customer_name"),
    col("product_id"),
    col("product_category"),
    col("order_date"),
    col("revenue"),
    col("quantity"),
    # Pre-calculated metrics
    (col("revenue") / col("quantity")).alias("avg_unit_price")
  ))
```

## 4. Performance Optimization Strategies

### 4.1 Delta Lake Optimization

```mermaid
flowchart LR
    subgraph "Optimization Techniques"
        ZOrder["`**Z-ORDER Clustering**
        • Co-locate related data
        • Improve data skipping
        • Multi-column optimization`"]
        
        LiquidCluster["`**Liquid Clustering**
        • Automatic clustering
        • Adaptive optimization
        • Write-time clustering`"]
        
        DataSkip["`**Data Skipping**
        • File-level statistics
        • Min/max values
        • Automatic pruning`"]
        
        Compact["`**File Compaction**
        • Optimize file sizes
        • Reduce small files
        • Improve read performance`"]
    end
    
    subgraph "Partitioning Strategies"
        TimePartition["`**Time-based**
        • Date/timestamp columns
        • Natural data distribution
        • Query pattern alignment`"]
        
        HashPartition["`**Hash-based**
        • Even distribution
        • High cardinality columns
        • Avoid data skew`"]
        
        HybridPartition["`**Hybrid Approach**
        • Multiple partition keys
        • Balanced distribution
        • Query optimization`"]
    end
    
    subgraph "Performance Monitoring"
        QueryMetrics["`**Query Metrics**
        • Execution time
        • Data scanned
        • Files read`"]
        
        FileMetrics["`**File Metrics**
        • File sizes
        • Number of files
        • Compression ratio`"]
        
        ClusterMetrics["`**Cluster Metrics**
        • CPU utilization
        • Memory usage
        • I/O throughput`"]
    end
    
    ZOrder --> QueryMetrics
    LiquidCluster --> FileMetrics
    DataSkip --> QueryMetrics
    Compact --> FileMetrics
    
    TimePartition --> QueryMetrics
    HashPartition --> ClusterMetrics
    HybridPartition --> QueryMetrics
    
    classDef optimizationClass fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef partitionClass fill:#FF9800,stroke:#F57C00,color:#fff
    classDef monitoringClass fill:#2196F3,stroke:#1565C0,color:#fff
    
    class ZOrder,LiquidCluster,DataSkip,Compact optimizationClass
    class TimePartition,HashPartition,HybridPartition partitionClass
    class QueryMetrics,FileMetrics,ClusterMetrics monitoringClass
```

#### Z-ORDER Clustering
Groups related information in the same set of files:

```python
# Optimize table with Z-ORDER
spark.sql("OPTIMIZE table_name ZORDER BY (column1, column2)")
```

#### Data Skipping
Delta Lake automatically collects statistics to skip irrelevant files:

```python
# Enable data skipping with proper file sizes
spark.conf.set("spark.sql.files.maxPartitionBytes", "1073741824")  # 1GB
```

### 4.2 Partitioning Strategies

#### Time-based Partitioning
```python
# Partition by date for time-series data
df.write \
  .partitionBy("year", "month") \
  .mode("overwrite") \
  .option("overwriteSchema", "true") \
  .saveAsTable("time_partitioned_table")
```

#### Hash Partitioning
For evenly distributed data:

```python
# Use hash partitioning for uniform distribution
df.repartition(col("customer_id")).write.saveAsTable("hash_partitioned_table")
```

### 4.3 Caching Strategies

#### Delta Cache
Automatically caches frequently accessed data:

```python
# Enable Delta cache (automatic)
spark.conf.set("spark.databricks.io.cache.enabled", "true")
```

#### Spark Cache
For programmatic control:

```python
# Cache frequently accessed DataFrame
df.cache()
df.count()  # Trigger caching
```

**Reference**: [Delta Lake Performance Tuning](https://docs.delta.io/latest/optimizations-oss.html)

## 5. Data Governance and Quality

### 5.1 Unity Catalog Integration

#### Schema and Table Management
```python
# Create schema in Unity Catalog
spark.sql("CREATE SCHEMA IF NOT EXISTS catalog.schema")

# Create managed table
spark.sql("""
CREATE TABLE IF NOT EXISTS catalog.schema.table_name (
  id BIGINT,
  name STRING,
  created_at TIMESTAMP
) USING DELTA
""")
```

#### Access Control
```python
# Grant permissions
spark.sql("GRANT SELECT ON TABLE catalog.schema.table_name TO `user@company.com`")
```

### 5.2 Data Quality Checks

#### Delta Lake Constraints
```python
# Add check constraints
spark.sql("""
ALTER TABLE table_name 
ADD CONSTRAINT valid_age CHECK (age >= 0 AND age <= 150)
""")
```

#### Expectations with Great Expectations
```python
# Define data quality expectations
import great_expectations as ge

df_ge = ge.from_pandas(df.toPandas())
df_ge.expect_column_values_to_not_be_null("customer_id")
df_ge.expect_column_values_to_be_unique("customer_id")
```

**Reference**: [Unity Catalog](https://docs.databricks.com/data-governance/unity-catalog/index.html)

## 6. Best Practices Summary

### Design Principles
1. **Start with Bronze**: Always preserve raw data
2. **Incremental Processing**: Use streaming where possible
3. **Schema Evolution**: Plan for changing requirements
4. **Data Quality**: Implement checks at each layer
5. **Documentation**: Maintain clear data lineage

### Performance Considerations
1. **Right-size Clusters**: Match compute to workload
2. **Optimize File Sizes**: Target 100MB-1GB per file
3. **Use Appropriate Partitioning**: Based on query patterns
4. **Monitor and Tune**: Regular performance analysis

### Governance Guidelines
1. **Use Unity Catalog**: Centralized metadata and access control
2. **Implement Lineage**: Track data flow and transformations
3. **Data Classification**: Understand and protect sensitive data
4. **Version Control**: Use Git for code and configs

## Conclusion

Effective data modeling and design in Databricks requires understanding the platform's unique capabilities, including Delta Lake's ACID properties, the Medallion architecture pattern, and Unity Catalog's governance features. Success depends on balancing performance, scalability, and maintainability while ensuring data quality and governance requirements are met.

The key is to start simple with the Bronze-Silver-Gold pattern and evolve your architecture as requirements become more complex, always keeping performance optimization and data governance in mind.
