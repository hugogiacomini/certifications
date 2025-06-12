# Google Cloud Professional Data Engineer Exam Guide - Detailed Topic Summary

---

# Section 1: Designing data processing systems (~22% of the exam)

## 1.1 Designing for security and compliance. Considerations include:

### Identity and Access Management (e.g., Cloud IAM and organization policies)

**Concepts:**  
Identity and Access Management (IAM) is foundational for securing cloud resources. It controls who (users, groups, service accounts) can take what action (roles/permissions) on which resources. The principle of least privilege is critical: only grant the minimum permissions necessary.

**Best Practices:**
- Use predefined roles for common tasks; create custom roles only when necessary.
- Assign roles to groups instead of individuals for easier management.
- Regularly review and audit IAM policies.
- Use service accounts for applications and automation, not for human users.
- Enable organization policies to enforce constraints (e.g., restrict resource creation to specific regions).

**Implementation in GCP:**
- Assign IAM roles at the organization, folder, project, or resource level.
- Use Cloud IAM Conditions for context-aware access (e.g., time-based, IP-based).
- Audit permissions using Cloud Asset Inventory and Policy Analyzer.
- Use Cloud Identity for managing users and groups.

**Example:**
```yaml
# Grant BigQuery Data Viewer role to a group at the project level
gcloud projects add-iam-policy-binding my-project \
    --member="group:data-analysts@example.com" \
    --role="roles/bigquery.dataViewer"
```

---

### Data security (encryption and key management)

**Concepts:**  
Data security ensures confidentiality and integrity of data at rest and in transit. Encryption is mandatory for sensitive data, and key management is crucial for controlling access to encrypted data.

**Best Practices:**
- Always encrypt data at rest and in transit.
- Use Cloud KMS for centralized key management.
- Rotate encryption keys regularly.
- Use CMEK or CSEK for workloads with strict compliance requirements.
- Restrict access to encryption keys using IAM.

**Implementation in GCP:**
- Data is encrypted by default at rest and in transit.
- Use Cloud KMS to create, manage, and rotate keys.
- Enable CMEK for services like BigQuery, Cloud Storage, and Compute Engine disks.
- Use audit logs to monitor key usage.

**Example:**
```bash
# Create a new key ring and key in Cloud KMS
gcloud kms keyrings create my-keyring --location=us-central1
gcloud kms keys create my-key --location=us-central1 --keyring=my-keyring --purpose=encryption
```
- Enable CMEK for a BigQuery dataset:
    - In the BigQuery console, select the dataset, click "Edit", and specify the KMS key.

---

### Privacy (e.g., personally identifiable information, and Cloud Data Loss Prevention API)

**Concepts:**  
Protecting privacy involves identifying, classifying, and securing sensitive data such as PII, PHI, or PCI. Data minimization, masking, and tokenization are common techniques.

**Best Practices:**
- Use Cloud DLP to scan and classify sensitive data.
- Mask or tokenize sensitive fields before storage or sharing.
- Limit access to sensitive data using IAM and VPC Service Controls.
- Implement data retention and deletion policies.

**Implementation in GCP:**
- Use Cloud DLP API to inspect, classify, and redact sensitive data in BigQuery, Cloud Storage, or Datastore.
- Set up scheduled DLP jobs for continuous monitoring.
- Apply transformation templates for masking or tokenization.

**Example:**
```bash
# Inspect a Cloud Storage file for PII using DLP
gcloud dlp jobs create inspect-gcs \
    --project=my-project \
    --storage-config-file=storage-config.json \
    --inspect-config-file=inspect-config.json
```
- Masking a column in BigQuery using DLP:
    - Use DLP to scan and replace sensitive values with asterisks or tokens.

---

### Regional considerations (data sovereignty) for data access and storage

**Concepts:**  
Data sovereignty refers to the legal and regulatory requirements governing where data is stored and processed. Organizations may need to keep data within specific geographic boundaries.

**Best Practices:**
- Choose storage locations that comply with data residency requirements.
- Use organization policies to restrict resource creation to approved regions.
- Understand the implications of multi-region vs. single-region storage.

**Implementation in GCP:**
- Specify region or multi-region when creating storage buckets, BigQuery datasets, etc.
- Use Organization Policy Service to enforce location constraints.
- Monitor resource locations using Cloud Asset Inventory.

**Example:**
```bash
# Create a Cloud Storage bucket in the EU region
gsutil mb -l EU gs://my-eu-bucket/
```
- Enforce resource location policy:
    - Use the Organization Policy Service to restrict allowed locations.

---

### Legal and regulatory compliance

**Concepts:**  
Compliance ensures adherence to laws and regulations such as GDPR, HIPAA, PCI DSS, and others. This includes data handling, storage, processing, and access controls.

**Best Practices:**
- Use Google Cloud’s compliance resources and certifications.
- Enable and monitor audit logs for all critical resources.
- Use Access Transparency and Access Approval for visibility into Google support access.
- Regularly review compliance documentation and update controls as regulations evolve.

**Implementation in GCP:**
- Enable Cloud Audit Logs for all services.
- Use Access Transparency to monitor Google support access.
- Use Access Approval to require explicit approval for Google support actions.
- Review compliance reports in the Google Cloud Console.

**Example:**
```bash
# Enable audit logs for all admin activity in a project
gcloud logging sinks create my-sink storage.googleapis.com/my-audit-logs-bucket \
    --log-filter='logName:"cloudaudit.googleapis.com"'
```
- Review compliance documentation:  
    - https://cloud.google.com/security/compliance

---

## 1.2 Designing for reliability and fidelity. Considerations include:

### Preparing and cleaning data (e.g., Dataprep, Dataflow, and Cloud Data Fusion)

**Concepts:**  
Data preparation and cleaning are essential for ensuring data quality, consistency, and usability. This involves removing duplicates, handling missing values, standardizing formats, and transforming raw data into a usable state.

**Best Practices:**
- Profile data to identify quality issues before processing.
- Automate data cleaning to reduce manual errors and improve consistency.
- Use schema validation to enforce data structure.
- Document data transformations for transparency and reproducibility.

**Implementation in GCP:**
- **Dataprep:** A visual tool for exploring, cleaning, and preparing data without writing code.
- **Dataflow:** A fully managed service for batch and stream data processing using Apache Beam.
- **Cloud Data Fusion:** A managed ETL service for building complex data pipelines with a graphical interface.

**Example:**
```python
# Dataflow Python pipeline snippet for cleaning data
import apache_beam as beam

def clean_record(record):
    record['email'] = record['email'].lower().strip()
    record['age'] = int(record['age']) if record['age'] else None
    return record

with beam.Pipeline() as p:
    (p
     | 'Read' >> beam.io.ReadFromText('gs://my-bucket/input.csv')
     | 'Parse' >> beam.Map(parse_csv)
     | 'Clean' >> beam.Map(clean_record)
     | 'Write' >> beam.io.WriteToText('gs://my-bucket/cleaned.csv'))
```
- Use Dataprep to visually clean and transform data, then export to BigQuery or Cloud Storage.
- Use Data Fusion to orchestrate complex ETL workflows with built-in plugins for data cleansing.

---

### Monitoring and orchestration of data pipelines

**Concepts:**  
Monitoring ensures data pipelines are running as expected, while orchestration manages dependencies, scheduling, and error handling across multiple pipeline steps.

**Best Practices:**
- Implement end-to-end monitoring with alerts for failures and performance issues.
- Use centralized logging for troubleshooting.
- Automate pipeline scheduling and retries.
- Track lineage and metadata for auditability.

**Implementation in GCP:**
- **Cloud Composer:** Managed Apache Airflow for orchestrating complex workflows.
- **Cloud Monitoring & Logging:** Monitor pipeline health, set up alerts, and analyze logs.
- **Dataflow Monitoring Interface:** Visualize job status, throughput, and errors.

**Example:**
```yaml
# Cloud Composer DAG snippet for orchestrating a Dataflow job
from airflow import DAG
from airflow.providers.google.cloud.operators.dataflow import DataflowTemplatedJobStartOperator

with DAG('data_pipeline', schedule_interval='@daily') as dag:
    start_dataflow = DataflowTemplatedJobStartOperator(
        task_id='run_dataflow',
        template='gs://my-templates/my-template',
        parameters={'input': 'gs://my-bucket/input.csv', 'output': 'gs://my-bucket/output.csv'},
        location='us-central1'
    )
```
- Use Cloud Monitoring to set up alerts for pipeline failures.
- Use Airflow (Cloud Composer) to manage dependencies and retries.

---

### Disaster recovery and fault tolerance

**Concepts:**  
Disaster recovery (DR) ensures business continuity in case of failures, while fault tolerance allows systems to continue operating despite component failures.

**Best Practices:**
- Design pipelines to be idempotent and restartable.
- Store data in multiple regions for redundancy.
- Regularly test backup and restore procedures.
- Use managed services with built-in high availability.

**Implementation in GCP:**
- Use regional or multi-regional storage for critical data (e.g., BigQuery, Cloud Storage).
- Enable snapshot and backup features for databases (e.g., Cloud SQL, Bigtable).
- Use Dataflow’s checkpointing for stateful streaming jobs.

**Example:**
```bash
# Create a multi-region Cloud Storage bucket for DR
gsutil mb -l US gs://my-multiregion-bucket/

# Enable BigQuery table snapshots
bq cp mydataset.mytable mydataset.mytable_backup_20240601
```
- Use Cloud SQL automated backups and point-in-time recovery.
- Test failover scenarios regularly.

---

### Making decisions related to ACID (atomicity, consistency, isolation, and durability) compliance and availability

**Concepts:**  
ACID properties ensure reliable transaction processing. In distributed systems, trade-offs between consistency and availability (CAP theorem) must be considered.

**Best Practices:**
- Choose storage systems based on required consistency and availability.
- Use ACID-compliant databases for transactional workloads.
- For analytics, eventual consistency may be acceptable for higher availability.

**Implementation in GCP:**
- **Cloud Spanner:** Globally distributed, strongly consistent, ACID-compliant database.
- **Cloud SQL:** Relational database with ACID guarantees.
- **Bigtable/BigQuery:** Designed for scalability and availability, with different consistency models.

**Example:**
```sql
-- Cloud Spanner transaction example
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```
- Use Cloud Spanner for workloads needing strong consistency and high availability.
- Use BigQuery for analytical workloads where eventual consistency is acceptable.

---

### Data validation

**Concepts:**  
Data validation ensures that data meets quality, format, and business rule requirements before further processing or storage.

**Best Practices:**
- Validate data at ingestion and before loading into target systems.
- Automate validation checks for schema, data types, and value ranges.
- Log and quarantine invalid records for review.

**Implementation in GCP:**
- Use Dataflow or Data Fusion to implement validation steps in pipelines.
- Use BigQuery’s schema enforcement and constraints.
- Integrate Cloud DLP for sensitive data validation.

**Example:**
```python
# Dataflow validation step
def validate_record(record):
    if not record['email'] or '@' not in record['email']:
        raise ValueError('Invalid email')
    if record['age'] < 0:
        raise ValueError('Negative age')
    return record

(p | 'Validate' >> beam.Map(validate_record))
```
- Use BigQuery’s NOT NULL and CHECK constraints for table columns.
- Set up alerts for validation failures using Cloud Monitoring.

---
## 1.3 Designing for flexibility and portability. Considerations include:

### Mapping current and future business requirements to the architecture

**Concepts:**  
Architectural flexibility means designing systems that can adapt to evolving business needs, scale with growth, and integrate new technologies. This involves understanding both current requirements and anticipating future changes, such as increased data volume, new data sources, or regulatory shifts.

**Best Practices:**
- Engage stakeholders early to gather comprehensive requirements.
- Use modular, loosely coupled components to enable easy updates or replacements.
- Design for scalability and extensibility (e.g., add new data sources or outputs with minimal disruption).
- Document assumptions and decision rationales to support future changes.
- Regularly review architecture against business goals.

**Implementation in GCP:**
- Use managed services (e.g., BigQuery, Dataflow, Pub/Sub) that scale automatically.
- Leverage APIs and connectors to integrate with external systems.
- Use Infrastructure as Code (IaC) tools (e.g., Terraform, Deployment Manager) for repeatable, versioned deployments.
- Implement CI/CD pipelines for rapid iteration and deployment.

**Example:**
```yaml
# Example: Modular pipeline using Dataflow and Pub/Sub
# Data ingestion via Pub/Sub, processing with Dataflow, storage in BigQuery

resources:
    - type: pubsub.v1.topic
        name: data-ingest-topic
    - type: dataflow.v1beta3.job
        name: process-data-job
        properties:
            inputTopic: $(ref.data-ingest-topic.name)
            outputTable: myproject:dataset.processed_data
```
- Use BigQuery’s partitioned and clustered tables to support future data growth.
- Add new Pub/Sub topics or Dataflow jobs as business needs evolve.

---

### Designing for data and application portability (e.g., multi-cloud and data residency requirements)

**Concepts:**  
Portability ensures that data and applications can move between environments (on-premises, different cloud providers) with minimal rework. This is critical for avoiding vendor lock-in, meeting regulatory requirements, and supporting disaster recovery.

**Best Practices:**
- Use open standards and formats (e.g., Parquet, Avro, CSV, JSON) for data storage and exchange.
- Containerize applications (e.g., Docker) to run consistently across environments.
- Abstract cloud-specific services behind APIs or service layers.
- Maintain clear documentation and automation scripts for deployment and migration.
- Consider hybrid and multi-cloud architectures for resilience and compliance.

**Implementation in GCP:**
- Use Google Kubernetes Engine (GKE) for container orchestration, supporting multi-cloud deployments.
- Store data in portable formats in Cloud Storage or BigQuery.
- Use Data Transfer Service, Datastream, or Storage Transfer Service for moving data between clouds.
- Implement VPC Service Controls and organization policies to enforce data residency.

**Example:**
```bash
# Export BigQuery table to Cloud Storage in Avro format for portability
bq extract --destination_format=AVRO mydataset.mytable gs://my-bucket/mytable.avro

# Deploy a Dockerized app to GKE
gcloud container clusters create my-cluster --region=us-central1
kubectl apply -f deployment.yaml
```
- Use Anthos for managing workloads across GCP, on-premises, and other clouds.
- Set up Storage Transfer Service to move data between AWS S3 and Google Cloud Storage.

---

### Data staging, cataloging, and discovery (data governance)

**Concepts:**  
Data staging involves preparing and storing data before it is processed or loaded into analytics systems. Cataloging and discovery are key aspects of data governance, enabling users to find, understand, and trust data assets.

**Best Practices:**
- Use a centralized data catalog to document datasets, schemas, lineage, and metadata.
- Implement data quality checks and validation at the staging layer.
- Control access to staging and cataloged data using IAM and audit logs.
- Tag and classify data for compliance, sensitivity, and lifecycle management.
- Enable data discovery through search, metadata, and lineage visualization.

**Implementation in GCP:**
- Use Cloud Storage buckets for staging raw and processed data.
- Use Data Catalog to register, tag, and search datasets across BigQuery, Cloud Storage, and Pub/Sub.
- Integrate Data Loss Prevention (DLP) for sensitive data classification.
- Use BigQuery’s metadata features (labels, descriptions, table expiration) for governance.

**Example:**
```bash
# Register a BigQuery dataset in Data Catalog with tags
gcloud data-catalog tags create \
        --tag-template=my_template \
        --location=us-central1 \
        --resource=//bigquery.googleapis.com/projects/myproject/datasets/mydataset

# Set up a Cloud Storage bucket for staging
gsutil mb -l us-central1 gs://my-staging-bucket/
```
- Use Data Catalog’s search and lineage features to enable data discovery.
- Apply IAM policies to restrict access to sensitive datasets and audit usage.

---

## 1.4 Designing data migrations. Considerations include:

### Analyzing current stakeholder needs, users, processes, and technologies and creating a plan to get to desired state

### Planning migration to Google Cloud (e.g., BigQuery Data Transfer Service, Database Migration Service, Transfer Appliance, Google Cloud networking, Datastream)

### Designing the migration validation strategy

### Designing the project, dataset, and table architecture to ensure proper data governance