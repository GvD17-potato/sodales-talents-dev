CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."profile_moderation_action" AS ENUM('approved', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."talent_profile_status" AS ENUM('draft', 'pending', 'approved', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."user_role_type" AS ENUM('talent', 'admin');--> statement-breakpoint
CREATE TABLE "inquiry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"talent_profile_id" uuid NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text NOT NULL,
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_moderation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"action" "profile_moderation_action" NOT NULL,
	"note" text,
	"moderator_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_portfolio_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "talent_portfolio_link_position_nonnegative" CHECK ("talent_portfolio_link"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "talent_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"headline" text,
	"bio" text,
	"location" text,
	"category_id" uuid,
	"status" "talent_profile_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "talent_skill_position_nonnegative" CHECK ("talent_skill"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_talent_profile_id_talent_profile_id_fk" FOREIGN KEY ("talent_profile_id") REFERENCES "public"."talent_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_moderation" ADD CONSTRAINT "profile_moderation_profile_id_talent_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."talent_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_portfolio_link" ADD CONSTRAINT "talent_portfolio_link_profile_id_talent_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."talent_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_profile" ADD CONSTRAINT "talent_profile_category_id_talent_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."talent_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_skill" ADD CONSTRAINT "talent_skill_profile_id_talent_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."talent_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiry_status_created_at_idx" ON "inquiry" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "inquiry_talent_profile_id_idx" ON "inquiry" USING btree ("talent_profile_id");--> statement-breakpoint
CREATE INDEX "profile_moderation_profile_id_created_at_idx" ON "profile_moderation" USING btree ("profile_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "talent_category_slug_uidx" ON "talent_category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "talent_portfolio_link_profile_id_position_idx" ON "talent_portfolio_link" USING btree ("profile_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "talent_profile_user_id_uidx" ON "talent_profile" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "talent_profile_slug_uidx" ON "talent_profile" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "talent_profile_status_updated_at_idx" ON "talent_profile" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "talent_profile_status_category_id_idx" ON "talent_profile" USING btree ("status","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "talent_skill_profile_id_name_uidx" ON "talent_skill" USING btree ("profile_id","name");--> statement-breakpoint
CREATE INDEX "talent_skill_profile_id_position_idx" ON "talent_skill" USING btree ("profile_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_user_id_uidx" ON "user_role" USING btree ("user_id");