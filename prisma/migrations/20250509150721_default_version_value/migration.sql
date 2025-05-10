-- AlterTable
CREATE SEQUENCE roadmap_version_seq;
ALTER TABLE "RoadMap" ALTER COLUMN "version" SET DEFAULT nextval('roadmap_version_seq');
ALTER SEQUENCE roadmap_version_seq OWNED BY "RoadMap"."version";
