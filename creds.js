const creds = {
  "type": "service_account",
  "project_id": "database-whm",
  "private_key_id": "75b7c1468c4d20bc72c15633915aa3556b78ab5d",
  "private_key": process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  "client_email": "database-whm@database-whm.iam.gserviceaccount.com",
  "client_id": "112577403094851733703",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/database-whm%40database-whm.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

module.exports = creds;
