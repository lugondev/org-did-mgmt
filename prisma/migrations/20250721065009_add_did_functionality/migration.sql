/*
  Warnings:

  - You are about to drop the column `status` on the `credentials` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `credentials` table. All the data in the column will be lost.
  - Added the required column `credentialSubject` to the `credentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "credentials" DROP COLUMN "status",
DROP COLUMN "userId",
ADD COLUMN     "credentialSubject" JSONB NOT NULL,
ADD COLUMN     "issuerDIDId" TEXT,
ADD COLUMN     "proof" JSONB,
ADD COLUMN     "schemaId" TEXT,
ALTER COLUMN "data" DROP NOT NULL,
ALTER COLUMN "issuer" DROP NOT NULL,
ALTER COLUMN "issuedAt" DROP NOT NULL,
ALTER COLUMN "issuedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "credentialsExchanged" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "networks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Public',
    "members" INTEGER NOT NULL DEFAULT 0,
    "isJoined" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_connections" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem_stats" (
    "id" TEXT NOT NULL,
    "totalPartners" INTEGER NOT NULL DEFAULT 0,
    "activeConnections" INTEGER NOT NULL DEFAULT 0,
    "credentialExchanges" INTEGER NOT NULL DEFAULT 0,
    "verificationRequests" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecosystem_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "did_documents" (
    "id" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "document" JSONB NOT NULL,
    "method" TEXT NOT NULL,
    "controller" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "did_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cryptographic_keys" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "controller" TEXT NOT NULL,
    "publicKeyMultibase" TEXT NOT NULL,
    "privateKeyMultibase" TEXT,
    "purpose" TEXT[],
    "didDocumentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cryptographic_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_schemas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "context" TEXT[],
    "type" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "authorId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schemaId" TEXT NOT NULL,
    "template" JSONB NOT NULL,
    "defaultValues" JSONB,
    "requiredFields" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_status" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "statusReason" TEXT,
    "revocationDate" TIMESTAMP(3),
    "suspensionDate" TIMESTAMP(3),
    "statusListIndex" INTEGER,
    "statusListCredential" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentation_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "requesterId" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "callbackUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentation_submissions" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "submitterId" TEXT,
    "presentation" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verificationResult" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presentation_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_email_key" ON "partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "networks_name_key" ON "networks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "did_documents_did_key" ON "did_documents"("did");

-- CreateIndex
CREATE UNIQUE INDEX "cryptographic_keys_didDocumentId_keyId_key" ON "cryptographic_keys"("didDocumentId", "keyId");

-- CreateIndex
CREATE UNIQUE INDEX "credential_schemas_name_version_key" ON "credential_schemas"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "credential_status_credentialId_key" ON "credential_status"("credentialId");

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_issuerDIDId_fkey" FOREIGN KEY ("issuerDIDId") REFERENCES "did_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "credential_schemas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_connections" ADD CONSTRAINT "partner_connections_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "did_documents" ADD CONSTRAINT "did_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cryptographic_keys" ADD CONSTRAINT "cryptographic_keys_didDocumentId_fkey" FOREIGN KEY ("didDocumentId") REFERENCES "did_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_schemas" ADD CONSTRAINT "credential_schemas_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_templates" ADD CONSTRAINT "credential_templates_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "credential_schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_templates" ADD CONSTRAINT "credential_templates_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_status" ADD CONSTRAINT "credential_status_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_requests" ADD CONSTRAINT "presentation_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_submissions" ADD CONSTRAINT "presentation_submissions_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "presentation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_submissions" ADD CONSTRAINT "presentation_submissions_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
