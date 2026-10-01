CREATE TYPE "course_section_status" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "lesson_status" AS ENUM('public', 'private', 'preview');--> statement-breakpoint
CREATE TYPE "product_status" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_products" (
	"courseId" uuid,
	"productId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_products_pkey" PRIMARY KEY("courseId","productId")
);
--> statement-breakpoint
CREATE TABLE "course_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"status" "course_section_status" DEFAULT 'private'::"course_section_status" NOT NULL,
	"order" integer NOT NULL,
	"courseId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"youtubeVideoId" text NOT NULL,
	"order" integer NOT NULL,
	"status" "lesson_status" DEFAULT 'private'::"lesson_status" NOT NULL,
	"sectionId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"imageUrl" text NOT NULL,
	"priceInDollars" integer NOT NULL,
	"status" "product_status" DEFAULT 'private'::"product_status" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"pricePaidInCents" integer NOT NULL,
	"productDetails" jsonb NOT NULL,
	"userId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"stripeSessionId" text NOT NULL UNIQUE,
	"refundedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clerkUserId" text NOT NULL UNIQUE,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"imageUrl" text,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_course_access" (
	"userId" uuid,
	"courseId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_course_access_pkey" PRIMARY KEY("userId","courseId")
);
--> statement-breakpoint
CREATE TABLE "user_lesson_complete" (
	"userId" uuid,
	"lessonId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_lesson_complete_pkey" PRIMARY KEY("userId","lessonId")
);
--> statement-breakpoint
ALTER TABLE "course_products" ADD CONSTRAINT "course_products_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "course_products" ADD CONSTRAINT "course_products_productId_products_id_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_sectionId_course_sections_id_fkey" FOREIGN KEY ("sectionId") REFERENCES "course_sections"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_productId_products_id_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_course_access" ADD CONSTRAINT "user_course_access_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_course_access" ADD CONSTRAINT "user_course_access_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_lesson_complete" ADD CONSTRAINT "user_lesson_complete_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_lesson_complete" ADD CONSTRAINT "user_lesson_complete_lessonId_lessons_id_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE;