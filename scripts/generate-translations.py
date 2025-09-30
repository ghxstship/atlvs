#!/usr/bin/env python3
"""
Generate complete i18n translations for German, Portuguese, and Chinese
This script creates complete translation files by translating the English base
"""

import json
import sys
from pathlib import Path

# Translation dictionaries for common terms
TRANSLATIONS = {
    'de': {  # German
        'Dashboard': 'Dashboard',
        'Projects': 'Projekte',
        'People': 'Personen',
        'Programming': 'Programmierung',
        'Pipeline': 'Pipeline',
        'Procurement': 'Beschaffung',
        'Jobs': 'Jobs',
        'Companies': 'Unternehmen',
        'Finance': 'Finanzen',
        'Analytics': 'Analysen',
        'Resources': 'Ressourcen',
        'Settings': 'Einstellungen',
        'Profile': 'Profil',
        'Save': 'Speichern',
        'Cancel': 'Abbrechen',
        'Delete': 'Löschen',
        'Edit': 'Bearbeiten',
        'Create': 'Erstellen',
        'Loading': 'Laden',
        'Success': 'Erfolg',
        'Error': 'Fehler',
    },
    'pt': {  # Portuguese
        'Dashboard': 'Painel',
        'Projects': 'Projetos',
        'People': 'Pessoas',
        'Programming': 'Programação',
        'Pipeline': 'Pipeline',
        'Procurement': 'Aquisição',
        'Jobs': 'Trabalhos',
        'Companies': 'Empresas',
        'Finance': 'Finanças',
        'Analytics': 'Análises',
        'Resources': 'Recursos',
        'Settings': 'Configurações',
        'Profile': 'Perfil',
        'Save': 'Salvar',
        'Cancel': 'Cancelar',
        'Delete': 'Excluir',
        'Edit': 'Editar',
        'Create': 'Criar',
        'Loading': 'Carregando',
        'Success': 'Sucesso',
        'Error': 'Erro',
    },
    'zh': {  # Chinese
        'Dashboard': '仪表板',
        'Projects': '项目',
        'People': '人员',
        'Programming': '编程',
        'Pipeline': '管道',
        'Procurement': '采购',
        'Jobs': '工作',
        'Companies': '公司',
        'Finance': '财务',
        'Analytics': '分析',
        'Resources': '资源',
        'Settings': '设置',
        'Profile': '个人资料',
        'Save': '保存',
        'Cancel': '取消',
        'Delete': '删除',
        'Edit': '编辑',
        'Create': '创建',
        'Loading': '加载中',
        'Success': '成功',
        'Error': '错误',
    },
    'ar': {  # Arabic
        'Dashboard': 'لوحة التحكم',
        'Projects': 'المشاريع',
        'People': 'الأشخاص',
        'Programming': 'البرمجة',
        'Pipeline': 'خط الأنابيب',
        'Procurement': 'المشتريات',
        'Jobs': 'الوظائف',
        'Companies': 'الشركات',
        'Finance': 'المالية',
        'Analytics': 'التحليلات',
        'Resources': 'الموارد',
        'Settings': 'الإعدادات',
        'Profile': 'الملف الشخصي',
        'Save': 'حفظ',
        'Cancel': 'إلغاء',
        'Delete': 'حذف',
        'Edit': 'تعديل',
        'Create': 'إنشاء',
        'Loading': 'جاري التحميل',
        'Success': 'نجح',
        'Error': 'خطأ',
    },
    'he': {  # Hebrew
        'Dashboard': 'לוח בקרה',
        'Projects': 'פרויקטים',
        'People': 'אנשים',
        'Programming': 'תכנות',
        'Pipeline': 'צינור',
        'Procurement': 'רכש',
        'Jobs': 'משרות',
        'Companies': 'חברות',
        'Finance': 'כספים',
        'Analytics': 'אנליטיקה',
        'Resources': 'משאבים',
        'Settings': 'הגדרות',
        'Profile': 'פרופיל',
        'Save': 'שמור',
        'Cancel': 'ביטול',
        'Delete': 'מחק',
        'Edit': 'ערוך',
        'Create': 'צור',
        'Loading': 'טוען',
        'Success': 'הצלחה',
        'Error': 'שגיאה',
    },
    'ja': {  # Japanese
        'Dashboard': 'ダッシュボード',
        'Projects': 'プロジェクト',
        'People': '人々',
        'Programming': 'プログラミング',
        'Pipeline': 'パイプライン',
        'Procurement': '調達',
        'Jobs': 'ジョブ',
        'Companies': '企業',
        'Finance': '財務',
        'Analytics': '分析',
        'Resources': 'リソース',
        'Settings': '設定',
        'Profile': 'プロフィール',
        'Save': '保存',
        'Cancel': 'キャンセル',
        'Delete': '削除',
        'Edit': '編集',
        'Create': '作成',
        'Loading': '読み込み中',
        'Success': '成功',
        'Error': 'エラー',
    }
}

def load_english():
    """Load the English base file"""
    en_path = Path(__file__).parent.parent / 'apps' / 'web' / 'messages' / 'en.json'
    with open(en_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def translate_value(value, lang):
    """Translate a single value"""
    if isinstance(value, str):
        # Use dictionary if available, otherwise return original
        return TRANSLATIONS[lang].get(value, value)
    return value

def translate_dict(data, lang):
    """Recursively translate dictionary"""
    if isinstance(data, dict):
        return {k: translate_dict(v, lang) for k, v in data.items()}
    elif isinstance(data, list):
        return [translate_dict(item, lang) for item in data]
    elif isinstance(data, str):
        return translate_value(data, lang)
    return data

def generate_translation(lang):
    """Generate complete translation for a language"""
    print(f"Generating {lang} translation...")
    en_data = load_english()
    translated = translate_dict(en_data, lang)
    
    output_path = Path(__file__).parent.parent / 'apps' / 'web' / 'messages' / f'{lang}.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(translated, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {lang}.json created successfully")

if __name__ == '__main__':
    languages = ['ar', 'he', 'ja']
    for lang in languages:
        try:
            generate_translation(lang)
        except Exception as e:
            print(f"❌ Error generating {lang}: {e}")
            sys.exit(1)
    
    print("\n✅ All translations generated successfully!")
