import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, isEmbedded, install } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Suppress button when already launched as an installed standalone app
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-navy bg-paper hover:bg-navy hover:text-white text-navy text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        {isInstallable ? (
          <Download className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
        )}
        <span>{isInstallable ? 'Uygulamayı Kur' : 'Telefona Kur'}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="exam-paper-sheet border border-rule max-w-md w-full p-6">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-rule">
              <div>
                <h3
                  id="pwa-guide-title"
                  className="font-serif text-lg font-bold text-ink"
                >
                  Telefonunuza Uygulama Olarak Kurun
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Kurulum sonrası internetsiz (çevrimdışı) olarak da
                  çalışabilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Kapat"
                className="p-1 text-ink-secondary hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-ink leading-relaxed">
              {isEmbedded && (
                <div className="p-3 border border-rule bg-paper-muted/60 text-xs text-ink-secondary">
                  <strong className="text-ink">Önemli:</strong> Kurulum
                  seçeneğinin görünmesi için paylaşılan uygulama bağlantısını
                  doğrudan telefonunuzun tarayıcısında (Chrome veya Safari)
                  açın.
                </div>
              )}

              {isIOS ? (
                <div className="space-y-2">
                  <p className="font-semibold text-navy text-xs uppercase tracking-wider">
                    iPhone / iPad (Safari)
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-ink-secondary">
                    <li>
                      Safari alt araç çubuğundaki{' '}
                      <strong className="text-ink inline-flex items-center gap-1">
                        <Share className="w-3.5 h-3.5 inline" /> Paylaş
                      </strong>{' '}
                      düğmesine dokunun.
                    </li>
                    <li>
                      Açılan menüyü aşağı kaydırıp{' '}
                      <strong className="text-ink">Ana Ekrana Ekle</strong>{' '}
                      seçeneğine dokunun.
                    </li>
                    <li>
                      Sağ üstten <strong className="text-ink">Ekle</strong>{' '}
                      diyerek kurulumu tamamlayın.
                    </li>
                  </ol>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="font-semibold text-navy text-xs uppercase tracking-wider">
                      Android (Google Chrome)
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-ink-secondary">
                      <li>
                        Tarayıcının sağ üstündeki{' '}
                        <strong className="text-ink">⋮ (Menü)</strong> simgesine
                        dokunun.
                      </li>
                      <li>
                        <strong className="text-ink">Uygulamayı yükle</strong>{' '}
                        veya{' '}
                        <strong className="text-ink">Ana ekrana ekle</strong>{' '}
                        seçeneğine dokunun.
                      </li>
                    </ol>
                  </div>

                  <div className="pt-3 border-t border-rule space-y-1.5">
                    <p className="font-semibold text-navy text-xs uppercase tracking-wider">
                      iPhone / iPad (Safari)
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-ink-secondary">
                      <li>
                        Alt menüdeki <strong className="text-ink">Paylaş</strong>{' '}
                        simgesine dokunun.
                      </li>
                      <li>
                        <strong className="text-ink">Ana Ekrana Ekle</strong>{' '}
                        seçeneğini onaylayın.
                      </li>
                    </ol>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-2.5 bg-navy hover:bg-navy-hover text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
