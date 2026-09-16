import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Yakalanan Arayüz Hatası (ErrorBoundary):', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  handleResetToHome = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#2d3748] flex items-center justify-center p-4">
          <div className="bg-[#ece9d8] border-2 border-red-600 shadow-2xl rounded p-6 max-w-lg w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 border border-red-300">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-2">
              Bir Arayüz Hatası Oluştu
            </h2>
            <p className="text-xs text-gray-700 mb-4 leading-relaxed">
              Ekran yüklenirken beklenmeyen bir durum meydana geldi. Verileriniz güvendedir. Aşağıdaki butonlarla ekranı tazeleyebilirsiniz:
            </p>
            {this.state.error && (
              <div className="bg-white border border-gray-300 p-2.5 rounded text-left text-[11px] font-mono text-red-700 mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yeniden Yükle</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetToHome}
                className="px-3.5 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ana Ekrana Dön</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
