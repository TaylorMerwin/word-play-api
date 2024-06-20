CREATE TABLE IF NOT EXISTS "writing_entry_table" (
	"entry_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"entry_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"word_count" integer NOT NULL,
	"writing_prompt_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "writing_prompt_table" (
	"prompt_id" serial PRIMARY KEY NOT NULL,
	"prompt_text" text NOT NULL,
	"genre" varchar NOT NULL,
	"theme" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_table" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"user_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "writing_entry_table" ADD CONSTRAINT "writing_entry_table_user_id_users_table_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "writing_entry_table" ADD CONSTRAINT "writing_entry_table_writing_prompt_id_writing_prompt_table_prompt_id_fk" FOREIGN KEY ("writing_prompt_id") REFERENCES "public"."writing_prompt_table"("prompt_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
