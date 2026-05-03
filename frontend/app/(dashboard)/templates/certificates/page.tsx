'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BiSave, BiShow } from 'react-icons/bi';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import { templateService } from '@/lib/services/templates';
import { Template } from '@/types';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const certificateVariables = [
  { label: 'Patient Name', value: '{{patient_name}}' },
  { label: 'Visit Date', value: '{{visit_date}}' },
  { label: 'Complaints', value: '{{complaints}}' },
  { label: 'Treatment Done', value: '{{treatment_done}}' },
  { label: 'Treatment From', value: '{{treatment_from}}' },
  { label: 'Treatment To', value: '{{treatment_to}}' },
  { label: 'Advise', value: '{{advise}}' },
  { label: 'Doctor Name', value: '{{doctor_name}}' },
  { label: 'Clinic Name', value: '{{clinic_name}}' },
];

const defaultContent = '<h2 style="text-align:center">MEDICAL CERTIFICATE</h2>' +
  '<p>This is to certify that <strong>{{patient_name}}</strong> visited our clinic on <strong>{{visit_date}}</strong>.</p>' +
  '<p><strong>Complaints:</strong> {{complaints}}</p>' +
  '<p><strong>Treatment Done:</strong> {{treatment_done}}</p>' +
  '<p>Treatment period: <strong>{{treatment_from}}</strong> to <strong>{{treatment_to}}</strong></p>' +
  '<p><strong>Advise:</strong> {{advise}}</p>' +
  '<br/><p style="text-align:right">Dr. {{doctor_name}}<br/>{{clinic_name}}</p>';

export default function CertificateTemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('Default Certificate');
  const [content, setContent] = useState(defaultContent);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateService.getAll();
        setTemplates(data);
        const cert = data.find(t => t.template_name.toLowerCase().includes('certificate'));
        if (cert) {
          setSelectedTemplateId(cert.id);
          setTemplateName(cert.template_name);
          setContent(cert.template_content || defaultContent);
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
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = async (id: number) => {
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      setSelectedTemplateId(tmpl.id);
      setTemplateName(tmpl.template_name);
      setContent(tmpl.template_content || defaultContent);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h5 className="font-bold text-slate-800 text-lg">Certificate Template Builder</h5>
          {templates.length > 0 && (
            <select value={selectedTemplateId || ''} onChange={(e) => handleSelectTemplate(Number(e.target.value))} className="text-sm border border-slate-200 rounded-lg px-2 py-1">
              <option value="">New Template</option>
              {templates.filter(t => t.template_name.toLowerCase().includes('certificate')).map(t => (
                <option key={t.id} value={t.id}>{t.template_name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          {message && <span className={`text-xs ${message.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>{message}</span>}
          <Button variant="outline-secondary" onClick={() => setShowPreview(!showPreview)} icon={<BiShow />}>
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} loading={saving} icon={<BiSave />}>Save Template</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-4 sticky top-4">
            <h6 className="font-bold text-sm text-slate-700 mb-3">Template Name</h6>
            <FormInput label="" value={templateName} onChange={(e) => setTemplateName(e.target.value)} name="template_name" />

            <h6 className="font-bold text-sm text-slate-700 mt-4 mb-3">Variables</h6>
            <div className="space-y-2">
              {certificateVariables.map((v) => (
                <button key={v.value} onClick={() => insertVariable(v.value)} className="w-full text-left px-3 py-2 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all font-medium">
                  {v.label}
                  <span className="block text-[10px] text-indigo-400 mt-0.5">{v.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {showPreview ? (
              <div className="p-6 min-h-[500px]">
                <div className="border border-slate-200 rounded-xl p-8 bg-white prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            ) : (
              <div className="min-h-[500px]">
                <ReactQuill theme="snow" value={content} onChange={setContent} modules={{ toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ align: [] }], [{ list: 'ordered' }, { list: 'bullet' }], [{ indent: '-1' }, { indent: '+1' }], ['clean']] }} formats={['header', 'bold', 'italic', 'underline', 'strike', 'align', 'list', 'indent']} className="h-[440px]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
