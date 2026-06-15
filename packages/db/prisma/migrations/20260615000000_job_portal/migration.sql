-- ─── Job Portal Phase — additive only, no drops ─────────────────────────

CREATE TABLE IF NOT EXISTS "EmployerProfile" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "companyName"   TEXT NOT NULL,
    "companyNameMl" TEXT,
    "slug"          TEXT NOT NULL,
    "companyType"   TEXT NOT NULL,
    "logo"          TEXT,
    "banner"        TEXT,
    "description"   TEXT NOT NULL DEFAULT '',
    "descriptionMl" TEXT,
    "website"       TEXT,
    "phone"         TEXT,
    "email"         TEXT,
    "whatsapp"      TEXT,
    "address"       TEXT,
    "city"          TEXT,
    "state"         TEXT,
    "country"       TEXT NOT NULL DEFAULT 'IN',
    "employeeCount" TEXT,
    "foundedYear"   INTEGER,
    "accreditations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isVerified"    BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmployerProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EmployerProfile_userId_key" ON "EmployerProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "EmployerProfile_slug_key"   ON "EmployerProfile"("slug");
CREATE INDEX IF NOT EXISTS "EmployerProfile_country_city_idx"  ON "EmployerProfile"("country","city");
CREATE INDEX IF NOT EXISTS "EmployerProfile_companyType_idx"   ON "EmployerProfile"("companyType");
DO $$ BEGIN
  ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "EmployerTeamMember" (
    "id"                TEXT NOT NULL,
    "employerProfileId" TEXT NOT NULL,
    "userId"            TEXT NOT NULL,
    "role"              TEXT NOT NULL DEFAULT 'recruiter',
    "invitedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt"        TIMESTAMP(3),
    CONSTRAINT "EmployerTeamMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EmployerTeamMember_employerProfileId_userId_key" ON "EmployerTeamMember"("employerProfileId","userId");
CREATE INDEX IF NOT EXISTS "EmployerTeamMember_userId_idx" ON "EmployerTeamMember"("userId");
DO $$ BEGIN
  ALTER TABLE "EmployerTeamMember" ADD CONSTRAINT "EmployerTeamMember_employerProfileId_fkey"
    FOREIGN KEY ("employerProfileId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "EmployerTeamMember" ADD CONSTRAINT "EmployerTeamMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "CandidateProfile" (
    "id"                 TEXT NOT NULL,
    "userId"             TEXT NOT NULL,
    "doctorId"           TEXT,
    "fullName"           TEXT NOT NULL,
    "fullNameMl"         TEXT,
    "headline"           TEXT,
    "phone"              TEXT,
    "whatsapp"           TEXT,
    "email"              TEXT,
    "dateOfBirth"        TIMESTAMP(3),
    "gender"             TEXT,
    "currentLocation"    TEXT,
    "preferredLocations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "currentSalary"      INTEGER,
    "expectedSalary"     INTEGER,
    "salaryCurrency"     TEXT NOT NULL DEFAULT 'INR',
    "noticePeriod"       TEXT,
    "availability"       TEXT NOT NULL DEFAULT 'open_to_offers',
    "profileVisibility"  TEXT NOT NULL DEFAULT 'public',
    "resumeUrl"          TEXT,
    "resumeParsedData"   JSONB,
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "totalExperience"    INTEGER NOT NULL DEFAULT 0,
    "highestQualification" TEXT,
    "specializations"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "skills"             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "languages"          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "currentLicenses"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "willingToRelocate"  BOOLEAN NOT NULL DEFAULT false,
    "openToTelemedicine" BOOLEAN NOT NULL DEFAULT false,
    "openToLocum"        BOOLEAN NOT NULL DEFAULT false,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CandidateProfile_userId_key"   ON "CandidateProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "CandidateProfile_doctorId_key" ON "CandidateProfile"("doctorId");
CREATE INDEX IF NOT EXISTS "CandidateProfile_availability_idx"    ON "CandidateProfile"("availability");
CREATE INDEX IF NOT EXISTS "CandidateProfile_currentLocation_idx" ON "CandidateProfile"("currentLocation");
DO $$ BEGIN
  ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_doctorId_fkey"
    FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "CandidateEducation" (
    "id"             TEXT NOT NULL,
    "candidateId"    TEXT NOT NULL,
    "institution"    TEXT NOT NULL,
    "degree"         TEXT NOT NULL,
    "specialization" TEXT,
    "university"     TEXT,
    "startYear"      INTEGER NOT NULL,
    "endYear"        INTEGER,
    "grade"          TEXT,
    "isCurrent"      BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CandidateEducation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CandidateEducation_candidateId_idx" ON "CandidateEducation"("candidateId");
DO $$ BEGIN
  ALTER TABLE "CandidateEducation" ADD CONSTRAINT "CandidateEducation_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "CandidateExperience" (
    "id"             TEXT NOT NULL,
    "candidateId"    TEXT NOT NULL,
    "jobTitle"       TEXT NOT NULL,
    "employer"       TEXT NOT NULL,
    "employerType"   TEXT,
    "location"       TEXT,
    "country"        TEXT,
    "startDate"      TIMESTAMP(3) NOT NULL,
    "endDate"        TIMESTAMP(3),
    "isCurrent"      BOOLEAN NOT NULL DEFAULT false,
    "description"    TEXT,
    "specialization" TEXT,
    "employmentType" TEXT,
    CONSTRAINT "CandidateExperience_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CandidateExperience_candidateId_idx" ON "CandidateExperience"("candidateId");
DO $$ BEGIN
  ALTER TABLE "CandidateExperience" ADD CONSTRAINT "CandidateExperience_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "CandidateCertification" (
    "id"               TEXT NOT NULL,
    "candidateId"      TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "issuingAuthority" TEXT,
    "issueDate"        TIMESTAMP(3) NOT NULL,
    "expiryDate"       TIMESTAMP(3),
    "credentialId"     TEXT,
    "verificationUrl"  TEXT,
    CONSTRAINT "CandidateCertification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CandidateCertification_candidateId_idx" ON "CandidateCertification"("candidateId");
DO $$ BEGIN
  ALTER TABLE "CandidateCertification" ADD CONSTRAINT "CandidateCertification_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "JobApp" (
    "id"              TEXT NOT NULL,
    "jobId"           TEXT NOT NULL,
    "candidateId"     TEXT NOT NULL,
    "coverLetter"     TEXT,
    "resumeUrl"       TEXT,
    "status"          TEXT NOT NULL DEFAULT 'applied',
    "matchScore"      INTEGER,
    "appliedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectionReason" TEXT,
    "notes"           TEXT,
    CONSTRAINT "JobApp_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "JobApp_jobId_candidateId_key"   ON "JobApp"("jobId","candidateId");
CREATE INDEX IF NOT EXISTS "JobApp_jobId_status_idx"               ON "JobApp"("jobId","status");
CREATE INDEX IF NOT EXISTS "JobApp_candidateId_status_idx"         ON "JobApp"("candidateId","status");
DO $$ BEGIN
  ALTER TABLE "JobApp" ADD CONSTRAINT "JobApp_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Interview" (
    "id"               TEXT NOT NULL,
    "applicationId"    TEXT NOT NULL,
    "scheduledAt"      TIMESTAMP(3) NOT NULL,
    "duration"         INTEGER NOT NULL DEFAULT 30,
    "type"             TEXT NOT NULL,
    "location"         TEXT,
    "meetingLink"      TEXT,
    "interviewerNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status"           TEXT NOT NULL DEFAULT 'scheduled',
    "feedback"         TEXT,
    "rating"           INTEGER,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Interview_applicationId_idx" ON "Interview"("applicationId");
CREATE INDEX IF NOT EXISTS "Interview_scheduledAt_idx"   ON "Interview"("scheduledAt");
DO $$ BEGIN
  ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "JobApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "SavedJob" (
    "id"          TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId"       TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SavedJob_candidateId_jobId_key" ON "SavedJob"("candidateId","jobId");
DO $$ BEGIN
  ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "JobAlert" (
    "id"             TEXT NOT NULL,
    "candidateId"    TEXT NOT NULL,
    "keywords"       TEXT,
    "specialization" TEXT,
    "location"       TEXT,
    "jobType"        TEXT,
    "salaryMin"      INTEGER,
    "frequency"      TEXT NOT NULL DEFAULT 'daily',
    "channel"        TEXT NOT NULL DEFAULT 'email',
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt"     TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobAlert_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JobAlert_candidateId_isActive_idx" ON "JobAlert"("candidateId","isActive");
DO $$ BEGIN
  ALTER TABLE "JobAlert" ADD CONSTRAINT "JobAlert_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "LocumAvailability" (
    "id"           TEXT NOT NULL,
    "candidateId"  TEXT NOT NULL,
    "startDate"    TIMESTAMP(3) NOT NULL,
    "endDate"      TIMESTAMP(3) NOT NULL,
    "locations"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "minDailyRate" INTEGER,
    "currency"     TEXT NOT NULL DEFAULT 'INR',
    "notes"        TEXT,
    "status"       TEXT NOT NULL DEFAULT 'available',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocumAvailability_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LocumAvailability_startDate_status_idx" ON "LocumAvailability"("startDate","status");
DO $$ BEGIN
  ALTER TABLE "LocumAvailability" ADD CONSTRAINT "LocumAvailability_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "LicensingGuide" (
    "id"                  TEXT NOT NULL,
    "jurisdiction"        TEXT NOT NULL,
    "slug"                TEXT NOT NULL,
    "title"               TEXT NOT NULL,
    "titleMl"             TEXT,
    "description"         TEXT NOT NULL DEFAULT '',
    "eligibilityCriteria" TEXT NOT NULL DEFAULT '',
    "documentChecklist"   JSONB NOT NULL DEFAULT '[]',
    "examDetails"         TEXT,
    "processingTime"      TEXT,
    "estimatedCost"       TEXT,
    "steps"               JSONB NOT NULL DEFAULT '[]',
    "tips"                TEXT,
    "lastUpdated"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LicensingGuide_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LicensingGuide_slug_key" ON "LicensingGuide"("slug");

CREATE TABLE IF NOT EXISTS "CandidateLicenseTrack" (
    "id"               TEXT NOT NULL,
    "candidateId"      TEXT NOT NULL,
    "jurisdictionSlug" TEXT NOT NULL,
    "stage"            TEXT NOT NULL DEFAULT 'documents_collected',
    "notes"            TEXT,
    "targetDate"       TIMESTAMP(3),
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateLicenseTrack_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CandidateLicenseTrack_candidateId_jurisdictionSlug_key" ON "CandidateLicenseTrack"("candidateId","jurisdictionSlug");
DO $$ BEGIN
  ALTER TABLE "CandidateLicenseTrack" ADD CONSTRAINT "CandidateLicenseTrack_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "MatchScore" (
    "id"          TEXT NOT NULL,
    "jobId"       TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "score"       INTEGER NOT NULL,
    "explanation" TEXT,
    "computedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MatchScore_jobId_candidateId_key"  ON "MatchScore"("jobId","candidateId");
CREATE INDEX IF NOT EXISTS "MatchScore_jobId_score_idx"               ON "MatchScore"("jobId","score" DESC);
CREATE INDEX IF NOT EXISTS "MatchScore_candidateId_score_idx"         ON "MatchScore"("candidateId","score" DESC);
DO $$ BEGIN
  ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
