import React, { useState, useEffect, useRef } from 'react';
import { Clock, Plus, Trash2, Volume2, VolumeX } from 'lucide-react';

interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  label?: string;
}

const AlarmClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState<string>('');
  const [newAlarmLabel, setNewAlarmLabel] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频元素
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 更新当前时间
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
    const timerId = setInterval(updateDateTime, 1000);

    return () => clearInterval(timerId);
  }, []);

  // 检查闹钟是否响起
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeString = now.toLocaleTimeString('zh-TW', { hour12: false }).substring(0, 5);
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTimeString) {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
        }
      });
    };

    const timerId = setInterval(checkAlarms, 1000);
    return () => clearInterval(timerId);
  }, [alarms]);

  const addAlarm = () => {
    if (!newAlarmTime) return;
    
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarmTime,
      enabled: true,
      label: newAlarmLabel || `鬧鐘 ${alarms.length + 1}`
    };
    
    setAlarms([...alarms, newAlarm]);
    setNewAlarmTime('');
    setNewAlarmLabel('');
  };

  const removeAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-white/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">簡易鬧鐘</h1>
        <div className="bg-black/20 rounded-2xl p-6 mb-4">
          <div className="text-5xl font-mono font-bold text-white mb-2">{currentTime}</div>
          <div className="text-lg text-white/80">{currentDate}</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={20} />
          設定新鬧鐘
        </h2>
        <div className="space-y-4">
          <input
            type="time"
            value={newAlarmTime}
            onChange={(e) => setNewAlarmTime(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="選擇時間"
          />
          <input
            type="text"
            value={newAlarmLabel}
            onChange={(e) => setNewAlarmLabel(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="鬧鐘標籤 (選填)"
          />
          <button
            onClick={addAlarm}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
          >
            <Plus size={20} />
            新增鬧鐘
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">鬧鐘列表</h2>
        {alarms.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Clock size={48} className="mx-auto mb-2 opacity-50" />
            <p>暫無鬧鐘設定</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => (
              <div 
                key={alarm.id} 
                className={`flex items-center justify-between p-4 rounded-xl ${
                  alarm.enabled 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-gray-500/20 border border-gray-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      alarm.enabled 
                        ? 'bg-green-500/30 text-green-200' 
                        : 'bg-gray-500/30 text-gray-400'
                    }`}
                  >
                    {alarm.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  <div>
                    <div className="text-white font-mono text-lg">{alarm.time}</div>
                    <div className="text-white/70 text-sm">{alarm.label}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeAlarm(alarm.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={stopAlarm}
          className="px-6 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
        >
          停止響鈴
        </button>
      </div>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AlarmClock;