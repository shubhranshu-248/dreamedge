export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey";
            columns: ["role_id"];
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      course_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          thumbnail_url: string | null;
          description: string | null;
          weight: number;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          thumbnail_url?: string | null;
          description?: string | null;
          weight?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          thumbnail_url?: string | null;
          description?: string | null;
          weight?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          long_description: string | null;
          thumbnail_url: string | null;
          preview_video_url: string | null;
          class: string | null;
          subject: string | null;
          teacher_name: string | null;
          teacher_avatar_url: string | null;
          price: number;
          original_price: number | null;
          currency: string | null;
          duration_hours: number | null;
          total_lessons: number | null;
          difficulty: string | null;
          is_published: boolean | null;
          is_featured: boolean | null;
          student_count: number | null;
          rating_avg: number | null;
          rating_count: number | null;
          tags: string[] | null;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          long_description?: string | null;
          thumbnail_url?: string | null;
          preview_video_url?: string | null;
          class?: string | null;
          subject?: string | null;
          teacher_name?: string | null;
          teacher_avatar_url?: string | null;
          price?: number;
          original_price?: number | null;
          currency?: string | null;
          duration_hours?: number | null;
          total_lessons?: number | null;
          difficulty?: string | null;
          is_published?: boolean | null;
          is_featured?: boolean | null;
          student_count?: number | null;
          rating_avg?: number | null;
          rating_count?: number | null;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          long_description?: string | null;
          thumbnail_url?: string | null;
          preview_video_url?: string | null;
          class?: string | null;
          subject?: string | null;
          teacher_name?: string | null;
          teacher_avatar_url?: string | null;
          price?: number;
          original_price?: number | null;
          currency?: string | null;
          duration_hours?: number | null;
          total_lessons?: number | null;
          difficulty?: string | null;
          is_published?: boolean | null;
          is_featured?: boolean | null;
          student_count?: number | null;
          rating_avg?: number | null;
          rating_count?: number | null;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          course_id: string;
          name: string;
          slug: string;
          color_code: string | null;
          weight: number;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          name: string;
          slug: string;
          color_code?: string | null;
          weight?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          name?: string;
          slug?: string;
          color_code?: string | null;
          weight?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      topics: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          slug: string;
          description: string | null;
          weight: number;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          slug: string;
          description?: string | null;
          weight?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          weight?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey";
            columns: ["subject_id"];
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
        ];
      };
      content_items: {
        Row: {
          id: string;
          topic_id: string;
          type: string;
          title: string;
          description: string | null;
          file_url: string | null;
          video_id: string | null;
          duration_seconds: number | null;
          is_paid: boolean;
          is_downloadable: boolean;
          is_printable: boolean;
          play_limit: number | null;
          status: string;
          weight: number;
          metadata: Json | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          type: string;
          title: string;
          description?: string | null;
          file_url?: string | null;
          video_id?: string | null;
          duration_seconds?: number | null;
          is_paid?: boolean;
          is_downloadable?: boolean;
          is_printable?: boolean;
          play_limit?: number | null;
          status?: string;
          weight?: number;
          metadata?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          file_url?: string | null;
          video_id?: string | null;
          duration_seconds?: number | null;
          is_paid?: boolean;
          is_downloadable?: boolean;
          is_printable?: boolean;
          play_limit?: number | null;
          status?: string;
          weight?: number;
          metadata?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_items_topic_id_fkey";
            columns: ["topic_id"];
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      tests: {
        Row: {
          id: string;
          course_id: string | null;
          topic_id: string | null;
          name: string;
          description: string | null;
          instructions: string | null;
          duration_minutes: number;
          total_marks: number;
          max_attempts: number;
          shuffle_questions: boolean;
          shuffle_options: boolean;
          pass_percentage: number | null;
          show_results_immediately: boolean;
          show_solutions: boolean;
          certificate_enabled: boolean;
          status: string;
          start_time: string | null;
          end_time: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          topic_id?: string | null;
          name: string;
          description?: string | null;
          instructions?: string | null;
          duration_minutes?: number;
          total_marks?: number;
          max_attempts?: number;
          shuffle_questions?: boolean;
          shuffle_options?: boolean;
          pass_percentage?: number | null;
          show_results_immediately?: boolean;
          show_solutions?: boolean;
          certificate_enabled?: boolean;
          status?: string;
          start_time?: string | null;
          end_time?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          topic_id?: string | null;
          name?: string;
          description?: string | null;
          instructions?: string | null;
          duration_minutes?: number;
          total_marks?: number;
          max_attempts?: number;
          shuffle_questions?: boolean;
          shuffle_options?: boolean;
          pass_percentage?: number | null;
          show_results_immediately?: boolean;
          show_solutions?: boolean;
          certificate_enabled?: boolean;
          status?: string;
          start_time?: string | null;
          end_time?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tests_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          id: string;
          test_id: string;
          type: string;
          content: string;
          options: Json | null;
          correct_answer: Json;
          explanation: string | null;
          hint: string | null;
          positive_marks: number;
          negative_marks: number;
          difficulty: string;
          topic_tag: string | null;
          image_url: string | null;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          test_id: string;
          type?: string;
          content: string;
          options?: Json | null;
          correct_answer: Json;
          explanation?: string | null;
          hint?: string | null;
          positive_marks?: number;
          negative_marks?: number;
          difficulty?: string;
          topic_tag?: string | null;
          image_url?: string | null;
          weight?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          test_id?: string;
          type?: string;
          content?: string;
          options?: Json | null;
          correct_answer?: Json;
          explanation?: string | null;
          hint?: string | null;
          positive_marks?: number;
          negative_marks?: number;
          difficulty?: string;
          topic_tag?: string | null;
          image_url?: string | null;
          weight?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey";
            columns: ["test_id"];
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
        ];
      };
      question_bank: {
        Row: {
          id: string;
          subject_id: string | null;
          topic_id: string | null;
          type: string;
          content: string;
          options: Json | null;
          correct_answer: Json;
          explanation: string | null;
          hint: string | null;
          positive_marks: number;
          negative_marks: number;
          difficulty: string;
          topic_tag: string | null;
          image_url: string | null;
          tags: string[] | null;
          used_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id?: string | null;
          topic_id?: string | null;
          type?: string;
          content: string;
          options?: Json | null;
          correct_answer: Json;
          explanation?: string | null;
          hint?: string | null;
          positive_marks?: number;
          negative_marks?: number;
          difficulty?: string;
          topic_tag?: string | null;
          image_url?: string | null;
          tags?: string[] | null;
          used_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string | null;
          topic_id?: string | null;
          type?: string;
          content?: string;
          options?: Json | null;
          correct_answer?: Json;
          explanation?: string | null;
          hint?: string | null;
          positive_marks?: number;
          negative_marks?: number;
          difficulty?: string;
          topic_tag?: string | null;
          image_url?: string | null;
          tags?: string[] | null;
          used_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          class: string | null;
          school_name: string | null;
          city: string | null;
          state: string | null;
          avatar_url: string | null;
          referral_code: string | null;
          referred_by: string | null;
          is_active: boolean | null;
          free_trial_expires_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          class?: string | null;
          school_name?: string | null;
          city?: string | null;
          state?: string | null;
          avatar_url?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          is_active?: boolean | null;
          free_trial_expires_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          class?: string | null;
          school_name?: string | null;
          city?: string | null;
          state?: string | null;
          avatar_url?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          is_active?: boolean | null;
          free_trial_expires_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          status: string;
          payment_id: string | null;
          payment_order_id: string | null;
          payment_amount: number | null;
          payment_method: string | null;
          payment_status: string | null;
          purchased_at: string | null;
          valid_until: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          status?: string;
          payment_id?: string | null;
          payment_order_id?: string | null;
          payment_amount?: number | null;
          payment_method?: string | null;
          payment_status?: string | null;
          purchased_at?: string | null;
          valid_until?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          status?: string;
          payment_id?: string | null;
          payment_order_id?: string | null;
          payment_amount?: number | null;
          payment_method?: string | null;
          payment_status?: string | null;
          purchased_at?: string | null;
          valid_until?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          video_url: string | null;
          duration_minutes: number | null;
          sort_order: number;
          is_free_preview: boolean | null;
          is_published: boolean | null;
          resources: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          video_url?: string | null;
          duration_minutes?: number | null;
          sort_order?: number;
          is_free_preview?: boolean | null;
          is_published?: boolean | null;
          resources?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          video_url?: string | null;
          duration_minutes?: number | null;
          sort_order?: number;
          is_free_preview?: boolean | null;
          is_published?: boolean | null;
          resources?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      student_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          course_id: string;
          status: string;
          progress_pct: number | null;
          last_position_seconds: number | null;
          completed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          course_id: string;
          status?: string;
          progress_pct?: number | null;
          last_position_seconds?: number | null;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          course_id?: string;
          status?: string;
          progress_pct?: number | null;
          last_position_seconds?: number | null;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_progress_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_progress_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      test_attempts: {
        Row: {
          id: string;
          student_id: string;
          test_id: string;
          answers: Json;
          score: number | null;
          total_marks: number | null;
          percentage: number | null;
          time_taken_seconds: number | null;
          attempt_number: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          test_id: string;
          answers?: Json;
          score?: number | null;
          total_marks?: number | null;
          percentage?: number | null;
          time_taken_seconds?: number | null;
          attempt_number?: number;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          test_id?: string;
          answers?: Json;
          score?: number | null;
          total_marks?: number | null;
          percentage?: number | null;
          time_taken_seconds?: number | null;
          attempt_number?: number;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "test_attempts_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "test_attempts_test_id_fkey";
            columns: ["test_id"];
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          amount: number;
          discount_amount: number;
          final_amount: number;
          payment_method: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: string;
          invoice_url: string | null;
          invoice_number: string | null;
          referral_code_used: string | null;
          remarks: string | null;
          processed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          amount: number;
          discount_amount?: number;
          final_amount: number;
          payment_method?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: string;
          invoice_url?: string | null;
          invoice_number?: string | null;
          referral_code_used?: string | null;
          remarks?: string | null;
          processed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          amount?: number;
          discount_amount?: number;
          final_amount?: number;
          payment_method?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: string;
          invoice_url?: string | null;
          invoice_number?: string | null;
          referral_code_used?: string | null;
          remarks?: string | null;
          processed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      refunds: {
        Row: {
          id: string;
          order_id: string;
          amount: number;
          reason: string;
          status: string;
          razorpay_refund_id: string | null;
          processed_by: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          amount: number;
          reason: string;
          status?: string;
          razorpay_refund_id?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          amount?: number;
          reason?: string;
          status?: string;
          razorpay_refund_id?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      live_classes: {
        Row: {
          id: string;
          course_id: string;
          subject_id: string | null;
          teacher_id: string | null;
          title: string;
          description: string | null;
          scheduled_at: string;
          duration_minutes: number;
          platform: string | null;
          meeting_url: string | null;
          status: string;
          recording_url: string | null;
          rewatch_content_id: string | null;
          attendee_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          subject_id?: string | null;
          teacher_id?: string | null;
          title: string;
          description?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          platform?: string | null;
          meeting_url?: string | null;
          status?: string;
          recording_url?: string | null;
          rewatch_content_id?: string | null;
          attendee_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          subject_id?: string | null;
          teacher_id?: string | null;
          title?: string;
          description?: string | null;
          scheduled_at?: string;
          duration_minutes?: number;
          platform?: string | null;
          meeting_url?: string | null;
          status?: string;
          recording_url?: string | null;
          rewatch_content_id?: string | null;
          attendee_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_classes_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          channel: string;
          thumbnail_url: string | null;
          action_url: string | null;
          target_type: string;
          target_id: string | null;
          course_id: string | null;
          is_read: boolean;
          sent_by: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          channel?: string;
          thumbnail_url?: string | null;
          action_url?: string | null;
          target_type?: string;
          target_id?: string | null;
          course_id?: string | null;
          is_read?: boolean;
          sent_by?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          channel?: string;
          thumbnail_url?: string | null;
          action_url?: string | null;
          target_type?: string;
          target_id?: string | null;
          course_id?: string | null;
          is_read?: boolean;
          sent_by?: string | null;
          sent_at?: string;
        };
        Relationships: [];
      };
      student_notifications: {
        Row: {
          id: string;
          student_id: string;
          notification_id: string;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          notification_id: string;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          notification_id?: string;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_notifications_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_notifications_notification_id_fkey";
            columns: ["notification_id"];
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          class: string | null;
          source: string | null;
          status: string;
          remarks: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          class?: string | null;
          source?: string | null;
          status?: string;
          remarks?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          class?: string | null;
          source?: string | null;
          status?: string;
          remarks?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      referral_codes: {
        Row: {
          id: string;
          code: string;
          student_id: string | null;
          discount_type: string;
          discount_value: number;
          usage_count: number;
          max_uses: number | null;
          is_active: boolean;
          valid_until: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          student_id?: string | null;
          discount_type?: string;
          discount_value?: number;
          usage_count?: number;
          max_uses?: number | null;
          is_active?: boolean;
          valid_until?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          student_id?: string | null;
          discount_type?: string;
          discount_value?: number;
          usage_count?: number;
          max_uses?: number | null;
          is_active?: boolean;
          valid_until?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          action_url: string | null;
          position: string;
          is_active: boolean;
          weight: number;
          starts_at: string | null;
          ends_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          image_url: string;
          action_url?: string | null;
          position?: string;
          is_active?: boolean;
          weight?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          image_url?: string;
          action_url?: string | null;
          position?: string;
          is_active?: boolean;
          weight?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          student_name: string;
          student_photo_url: string | null;
          content: string | null;
          video_url: string | null;
          rating: number | null;
          class: string | null;
          year: string | null;
          type: string;
          is_visible: boolean;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_name: string;
          student_photo_url?: string | null;
          content?: string | null;
          video_url?: string | null;
          rating?: number | null;
          class?: string | null;
          year?: string | null;
          type?: string;
          is_visible?: boolean;
          weight?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_name?: string;
          student_photo_url?: string | null;
          content?: string | null;
          video_url?: string | null;
          rating?: number | null;
          class?: string | null;
          year?: string | null;
          type?: string;
          is_visible?: boolean;
          weight?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      batches: {
        Row: {
          id: string;
          name: string;
          course_id: string;
          teacher_id: string | null;
          start_date: string | null;
          end_date: string | null;
          max_students: number | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          course_id: string;
          teacher_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          max_students?: number | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          course_id?: string;
          teacher_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          max_students?: number | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      batch_students: {
        Row: {
          id: string;
          batch_id: string;
          student_id: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          student_id: string;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          student_id?: string;
          enrolled_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batch_students_batch_id_fkey";
            columns: ["batch_id"];
            referencedRelation: "batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "batch_students_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_student_count: {
        Args: { p_course_id: string };
        Returns: undefined;
      };
      get_revenue_stats: {
        Args: { start_date?: string; end_date?: string };
        Returns: Json;
      };
      get_top_courses: {
        Args: { start_date?: string; end_date?: string; result_limit?: number };
        Returns: Json;
      };
      get_payment_method_breakdown: {
        Args: { start_date?: string; end_date?: string };
        Returns: Json;
      };
      get_daily_orders: {
        Args: { start_date?: string; end_date?: string };
        Returns: Json;
      };
      get_refund_stats: {
        Args: { start_date?: string; end_date?: string };
        Returns: Json;
      };
    };
    Enums: {
      user_role: "super_admin" | "content_creator" | "teacher" | "accountant" | "support_staff" | "technical";
      content_status: "draft" | "published" | "archived";
      content_type: "video" | "pdf" | "note" | "ebook" | "pyp" | "quiz";
      question_type: "mcq_single" | "mcq_multiple" | "true_false" | "short_answer" | "match_pair" | "subjective" | "image_based";
      difficulty_level: "easy" | "medium" | "hard";
      order_status: "pending" | "completed" | "failed" | "refunded";
      payment_method: "razorpay" | "upi" | "bank_transfer" | "cash" | "other";
      refund_status: "requested" | "approved" | "processed" | "rejected";
      live_class_status: "scheduled" | "live" | "ended" | "cancelled";
      notification_channel: "in_app" | "push" | "email" | "sms";
      lead_status: "new" | "contacted" | "interested" | "converted" | "lost";
      discount_type: "percentage" | "fixed";
      banner_position: "home_top" | "home_bottom" | "course_page";
      testimonial_type: "text" | "video";
      batch_status: "upcoming" | "active" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
}
