export interface Template {
  id: number;
  clinic_id: number;
  template_name: string;
  template_content?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  template_name: string;
  template_content: string;
}

export interface TemplateUpdate {
  template_name?: string;
  template_content?: string;
}
