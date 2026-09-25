import React, { useState } from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';

export default function RequestSection() {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [section, setSection] = useState('game');
    const [imageUrl, setImageUrl] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzS2jQfIave1KcB0_JdlE7Akv0y5i2HzR2N_Cy3vrCTs5q7r-Uv8duxrlv7lZiAKA3eiw/exec';
            
            await fetch(GOOGLE_SHEETS_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({
                    title,
                    category: section,
                    image: imageUrl,
                    message,
                    timestamp: new Date().toISOString()
                }),
            });

            setSuccessMsg('Request submitted successfully!');
            setTitle('');
            setSection('game');
            setImageUrl('');
            setMessage('');
        } catch (error) {
            console.error('Submission error:', error);
            setErrorMsg('Failed to submit request. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Request Games/Tools</h2>
            
            {successMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium">
                    {successMsg}
                </div>
            )}
            
            {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Title *
                    </label>
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Name of the game or tool"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Section *
                    </label>
                    <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        required
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] transition-all appearance-none"
                    >
                        <option value="game">Game</option>
                        <option value="hypervisior">Hypervisor</option>
                        <option value="steamtools">Steamtools</option>
                        <option value="tools">Tools</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Image URL (Good Quality) *
                    </label>
                    <input 
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message to Admin (Optional)
                    </label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        placeholder="Any additional details or reasons for the request..."
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] transition-all resize-none"
                    ></textarea>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? 'Sending Request...' : 'Send Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
