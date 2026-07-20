CREATE TABLE "kyc_requests" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending',
	"full_name" text,
	"document_type" text,
	"document_number" text,
	"front_image" text,
	"back_image" text,
	"selfie_image" text,
	"rejection_reason" text,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"firebase_id" text,
	"user_id" text NOT NULL,
	"market_id" text NOT NULL,
	"asset" text,
	"amount" numeric(20, 2) NOT NULL,
	"direction" text NOT NULL,
	"type" text,
	"entry_price" numeric(20, 6) NOT NULL,
	"exit_price" numeric(20, 6),
	"duration" integer NOT NULL,
	"time_left" integer,
	"expiry_time" integer NOT NULL,
	"expiration_time" numeric,
	"is_demo" boolean DEFAULT true,
	"account_type" text DEFAULT 'demo',
	"tournament_id" text,
	"status" text DEFAULT 'open',
	"payout_amount" numeric(20, 2),
	"payout" numeric(20, 2),
	"settled_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"method" text DEFAULT 'direct',
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"real_balance" numeric(20, 2) DEFAULT '0.00',
	"demo_balance" numeric(20, 2) DEFAULT '10000.00',
	"currency" text DEFAULT 'USD',
	"tfa_enabled" boolean DEFAULT false,
	"tfa_mode" text DEFAULT 'app',
	"tfa_secret" text,
	"is_verified" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"phone" text,
	"country" text,
	"status" text DEFAULT 'Standard',
	"kyc_status" text DEFAULT 'unverified',
	"referred_by_uid" text,
	"referral_code" text,
	"affiliate_balance" numeric(20, 2) DEFAULT '0.00',
	"total_affiliate_earnings" numeric(20, 2) DEFAULT '0.00',
	"referral_count" integer DEFAULT 0,
	"custom_affiliate_share" integer,
	"withdrawal_otp" text,
	"withdrawal_otp_expires_at" timestamp,
	"total_live_volume" numeric(20, 2) DEFAULT '0.00',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
