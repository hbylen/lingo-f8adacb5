import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, Volume2, VolumeX, Trash2, Plus } from 'lucide-react';

interface Alarm {
  id: string;
  time: string;
  active: boolean;
  label?: string;
}

const AlarmClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [alarmTime, setAlarmTime] = useState<string>('');
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newLabel, setNewLabel] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频元素
  useEffect(() => {
    // 创建一个简单的音频数据URL作为示例
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
    
    // 创建短暂的音频片段
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate);
    }
    
    // 将音频转换为Blob URL
    const wavBuffer = encodeWAV(buffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    audioRef.current = document.createElement('audio');
    audioRef.current.src = url;
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  // WAV编码辅助函数
  const encodeWAV = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    let length = 0;
    for (let i = 0; i < numChannels; i++) {
      length += buffer.getChannelData(i).length;
    }
    
    const bufferLength = length * 2; // 16-bit samples
    
    const view = new DataView(new ArrayBuffer(44 + bufferLength));
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + bufferLength, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numChannels * bitDepth / 8, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * bitDepth / 8, true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, bufferLength, true);
    
    // Write interleaved audio data
    let offset = 44;
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }
    
    for (let i = 0; i < channelData[0].length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
    
    return view.buffer;
  };

  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 更新时间和日期
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('zh-TW', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('zh-TW', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      }));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // 檢查鬧鐘是否響起
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentTimeStr) {
          // 播放鬧鐘音效
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play error:', e));
          }
          
          // 顯示通知
          if ('Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('鬧鐘響了！', {
                body: alarm.label || `時間到了: ${alarm.time}`,
                icon: '/vite.svg'
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('鬧鐘響了！', {
                    body: alarm.label || `時間到了: ${alarm.time}`,
                    icon: '/vite.svg'
                  });
                }
              });
            }
          }
        }
      });
    };

    const intervalId = setInterval(checkAlarms, 1000);
    return () => clearInterval(intervalId);
  }, [alarms]);

  const addAlarm = () => {
    if (!alarmTime) return;
    
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: alarmTime,
      active: true,
      label: newLabel || `鬧鐘 ${alarms.length + 1}`
    };
    
    setAlarms([...alarms, newAlarm]);
    setAlarmTime('');
    setNewLabel('');
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, active: !alarm.active } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 時鐘顯示 */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 mr-2 text-white" />
          <h1 className="text-2xl font-bold text-white">簡易鬧鐘</h1>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-white mb-2 tracking-wider">
            {currentTime}
          </div>
          <div className="text-lg text-white/80">
            {currentDate}
          </div>
        </div>
      </div>

      {/* 新增鬧鐘 */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/20 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          設定新鬧鐘
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">鬧鐘時間</label>
            <input
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">標籤 (選填)</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="例如：起床、吃藥..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={addAlarm}
            disabled={!alarmTime}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
              alarmTime 
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Bell className="w-5 h-5 mr-2" />
            新增鬧鐘
          </button>
        </div>
      </div>

      {/* 鬧鐘列表 */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          鬧鐘列表
        </h2>
        
        {alarms.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>目前沒有設定任何鬧鐘</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => (
              <div 
                key={alarm.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  alarm.active 
                    ? 'bg-green-500/20 border-green-400/50' 
                    : 'bg-gray-500/20 border-gray-400/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`text-2xl font-mono font-bold mr-3 ${
                      alarm.active ? 'text-white' : 'text-white/60'
                    }`}>
                      {alarm.time}
                    </div>
                    <div className="text-white/80">
                      {alarm.label}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        alarm.active 
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {alarm.active ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => deleteAlarm(alarm.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-white/60">
                  狀態: {alarm.active ? '啟用中' : '已停用'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmClock;