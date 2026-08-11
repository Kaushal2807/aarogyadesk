'use client';

import { useState, useEffect } from 'react';
import { BiSave, BiShow } from 'react-icons/bi';

// Inline star icon (BiStar not exported in installed react-icons version)
const IcStar = () => <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import TemplateEditor from '@/components/templates/TemplateEditor';
import { templateService } from '@/lib/services/templates';
import { caseTemplateVariables, defaultCaseTemplateContent } from '@/lib/template-render';
import { toast } from 'react-hot-toast';
import { Template } from '@/types';

export default function CaseTemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('Default Case Sheet');
  const [content, setContent] = useState(defaultCaseTemplateContent);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [defaultTemplateId, setDefaultTemplateId] = useState<number | null>(null);

  useEffect(() => {
    // Load saved default from localStorage
    const savedDefault = localStorage.getItem('default_case_template_id');
    if (savedDefault) setDefaultTemplateId(Number(savedDefault));

    const fetchTemplates = async () => {
      try {
        const data = await templateService.getAll();
        setTemplates(data);
        // Auto-load the default template if set, otherwise first case template
        const savedId = localStorage.getItem('default_case_template_id');
        const preferred = savedId ? data.find(t => t.id === Number(savedId)) : null;
        const fallback = data.find(t => t.template_name.toLowerCase().includes('case'));
        const toLoad = preferred || fallback;
        if (toLoad) {
          setSelectedTemplateId(toLoad.id);
          setTemplateName(toLoad.template_name);
          setContent(toLoad.template_content || defaultCaseTemplateContent);
        }
      } catch {
        // templates are optional
      }
    };
    fetchTemplates();
  }, []);

  const insertVariable = (variable: string) => {
    setContent(prev => prev + variable);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (selectedTemplateId) {
        await templateService.update(selectedTemplateId, { template_name: templateName, template_content: content });
      } else {
        const created = await templateService.create({ template_name: templateName, template_content: content });
        setSelectedTemplateId(created.id);
        setTemplates(prev => [...prev, created]);
      }
      setMessage('Template saved successfully!');
      toast.success('Case template saved successfully', {
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to save template';
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = () => {
    if (!selectedTemplateId) return;
    localStorage.setItem('default_case_template_id', String(selectedTemplateId));
    setDefaultTemplateId(selectedTemplateId);
    setMessage('✓ Set as default case template for printing!');
    toast.success('Set as default case template', {
      style: { background: '#10b981', color: '#fff', fontWeight: '500' },
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSelectTemplate = async (id: number) => {
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      setSelectedTemplateId(tmpl.id);
      setTemplateName(tmpl.template_name);
      setContent(tmpl.template_content || defaultCaseTemplateContent);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h5 className="font-bold text-slate-800 text-lg">Case Detail Template Builder</h5>
          {templates.length > 0 && (
            <select value={selectedTemplateId || ''} onChange={(e) => handleSelectTemplate(Number(e.target.value))} className="text-sm border border-slate-200 rounded-lg px-2 py-1">
              <option value="">New Template</option>
              {templates.filter(t => t.template_name.toLowerCase().includes('case')).map(t => (
                <option key={t.id} value={t.id}>{t.template_name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {message && (
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
              message.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>{message}</span>
          )}
          {selectedTemplateId && defaultTemplateId === selectedTemplateId && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              <IcStar /> Default
            </span>
          )}
          <Button variant="outline-secondary" onClick={() => setShowPreview(!showPreview)} icon={<BiShow />}>
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <button
            onClick={handleSetDefault}
            disabled={!selectedTemplateId}
            title="Set this as the default template used when printing case files"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-amber-300 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IcStar /> Set as Default
          </button>
          <Button onClick={handleSave} loading={saving} icon={<BiSave />}>Save Template</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-4 sticky top-4">
            <h6 className="font-bold text-sm text-slate-700 mb-3">Template Name</h6>
            <FormInput label="" value={templateName} onChange={(e) => setTemplateName(e.target.value)} name="template_name" />

            <h6 className="font-bold text-sm text-slate-700 mt-4 mb-3">Variables</h6>
            <p className="text-[10px] text-slate-400 mb-2">Click to insert at cursor position</p>
            <div className="space-y-2">
              {caseTemplateVariables.map((v) => (
                <button key={v.value} onClick={() => insertVariable(v.value)} className="w-full text-left px-3 py-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all font-medium">
                  {v.label}
                  <span className="block text-[10px] text-purple-400 mt-0.5">{v.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {showPreview ? (
            <div className="bg-white rounded-2xl shadow-card p-6 min-h-[520px]">
              <div className="border border-slate-200 rounded-xl p-8 bg-white prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ) : (
            <TemplateEditor
              value={content}
              onChange={setContent}
              placeholder="Start building your case detail template here. Use the variables panel on the left to insert patient data placeholders like {{patient_name}}, {{patient_uid}}, etc."
              minHeight={480}
            />
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
