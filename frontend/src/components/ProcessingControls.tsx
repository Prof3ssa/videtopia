'use client';

import { useState } from 'react';
import { Settings, Scissors, Crop, Monitor, Zap, Palette } from 'lucide-react';
import { useVideoStore } from '@/store/videoStore';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { 
  getQualityPresets, 
  getSpeedPresets, 
  getResolutionPresets,
  getAspectRatioPresets
} from '@/lib/utils';
import { cn } from '@/lib/utils';

export const ProcessingControls = () => {
  const { settings, setSettings, currentFile } = useVideoStore();
  const { processVideo } = useVideoProcessing();
  const [activeTab, setActiveTab] = useState('format');

  const handleProcess = async () => {
    if (!currentFile) return;
    await processVideo(settings);
  };

  const tabs = [
    { id: 'format', label: 'Format', icon: Settings },
    { id: 'trim', label: 'Trim', icon: Scissors },
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'scale', label: 'Scale', icon: Monitor },
    { id: 'speed', label: 'Speed', icon: Zap },
    { id: 'effects', label: 'Effects', icon: Palette },
  ];

  return (
    <div className="bg-white rounded-lg border p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Processing Options</h3>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-4 sm:mb-6 border-b overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex-shrink-0",
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.charAt(0)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4 sm:space-y-6 max-h-96 overflow-y-auto">
        {/* Format Tab */}
        {activeTab === 'format' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {['mp4', 'webm', 'gif'].map((format) => (
                  <button
                    key={format}
                    onClick={() => setSettings({ format: format as 'mp4' | 'webm' | 'gif' })}
                    className={cn(
                      "px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors",
                      settings.format === format
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {getQualityPresets().map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setSettings({ quality: preset.value as 'high' | 'medium' | 'low' })}
                    className={cn(
                      "px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors text-left",
                      settings.quality === preset.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs opacity-75 hidden sm:block">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trim Tab */}
        {activeTab === 'trim' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max={currentFile?.duration || 0}
                  step="0.1"
                  value={settings.trim?.start || 0}
                  onChange={(e) => setSettings({
                    trim: {
                      start: parseFloat(e.target.value) || 0,
                      duration: settings.trim?.duration || (currentFile?.duration || 0)
                    }
                  })}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max={currentFile?.duration || 0}
                  step="0.1"
                  value={settings.trim?.duration || (currentFile?.duration || 0)}
                  onChange={(e) => setSettings({
                    trim: {
                      start: settings.trim?.start || 0,
                      duration: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Crop Tab */}
        {activeTab === 'crop' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {getAspectRatioPresets().map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      if (preset.width && preset.height) {
                        setSettings({
                          crop: {
                            x: 0,
                            y: 0,
                            width: preset.width,
                            height: preset.height
                          }
                        });
                      } else {
                        setSettings({ crop: undefined });
                      }
                    }}
                    className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.crop?.width || currentFile?.width || 0}
                  onChange={(e) => setSettings({
                    crop: {
                      x: settings.crop?.x || 0,
                      y: settings.crop?.y || 0,
                      width: parseInt(e.target.value) || 0,
                      height: settings.crop?.height || (currentFile?.height || 0)
                    }
                  })}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.crop?.height || currentFile?.height || 0}
                  onChange={(e) => setSettings({
                    crop: {
                      x: settings.crop?.x || 0,
                      y: settings.crop?.y || 0,
                      width: settings.crop?.width || (currentFile?.width || 0),
                      height: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scale Tab */}
        {activeTab === 'scale' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {getResolutionPresets().map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSettings({
                      scale: {
                        width: preset.width,
                        height: preset.height
                      }
                    })}
                    className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.scale?.width || currentFile?.width || 0}
                  onChange={(e) => setSettings({
                    scale: {
                      width: parseInt(e.target.value) || 0,
                      height: settings.scale?.height || (currentFile?.height || 0)
                    }
                  })}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.scale?.height || currentFile?.height || 0}
                  onChange={(e) => setSettings({
                    scale: {
                      width: settings.scale?.width || (currentFile?.width || 0),
                      height: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Speed Tab */}
        {activeTab === 'speed' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speed Presets
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
                {getSpeedPresets().map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSettings({ speed: preset.value })}
                    className={cn(
                      "px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors",
                      settings.speed === preset.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Speed: {settings.speed}x
              </label>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={settings.speed}
                onChange={(e) => setSettings({ speed: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Effects
              </label>
              <div className="space-y-2">
                {[
                  { id: 'reverse', label: 'Reverse Video' },
                  { id: 'blur', label: 'Blur Effect' },
                  { id: 'sharpen', label: 'Sharpen' },
                  { id: 'brightness', label: 'Brightness' },
                  { id: 'contrast', label: 'Contrast' },
                ].map((effect) => (
                  <label key={effect.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.effects.includes(effect.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({
                            effects: [...settings.effects, effect.id]
                          });
                        } else {
                          setSettings({
                            effects: settings.effects.filter(e => e !== effect.id)
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{effect.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
        <button
          onClick={handleProcess}
          disabled={!currentFile}
          className="flex-1 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Process Video
        </button>
      </div>
    </div>
  );
};
