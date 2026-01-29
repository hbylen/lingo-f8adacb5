import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlarmClock, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface Alarm {
  id: string;
  time: string;
  active: boolean;
  label: string;
}

const AlarmClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 檢查是否有鬧鐘到了
  useEffect(() => {
    const now = currentTime.toLocaleTimeString('en-US', { hour12: false });
    
    alarms.forEach(alarm => {
      if (alarm.active && alarm.time === now) {
        playAlarm();
      }
    });
  }, [currentTime, alarms]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const addAlarm = () => {
    if (!newAlarmTime) return;

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarmTime,
      active: true,
      label: newAlarmLabel || `鬧鐘 ${alarms.length + 1}`
    };

    setAlarms([...alarms, newAlarm]);
    setNewAlarmTime('');
    setNewAlarmLabel('');
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm =>
      alarm.id === id ? { ...alarm, active: !alarm.active } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const playAlarm = () => {
    setIsPlaying(true);
    // 創建一個簡單的音調來模擬鬧鐘聲音
    if (!audioRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        setIsPlaying(false);
      }, 3000);
    }
  };

  const stopAlarm = () => {
    setIsPlaying(false);
  };

  const resetAlarms = () => {
    setAlarms([]);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
      {/* 時間顯示區域 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-6 h-6 text-white mr-2" />
          <h1 className="text-2xl font-bold text-white">時鐘</h1>
        </div>
        <div className="text-5xl font-mono font-bold text-white mb-2 tracking-wider">
          {formatTime(currentTime)}
        </div>
        <div className="text-lg text-white/80">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* 鬧鐘設置區域 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <AlarmClock className="w-5 h-5 mr-2" />
          設定鬧鐘
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="time"
            value={newAlarmTime}
            onChange={(e) => setNewAlarmTime(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="選擇時間"
          />
          <input
            type="text"
            value={newAlarmLabel}
            onChange={(e) => setNewAlarmLabel(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="標籤"
          />
          <button
            onClick={addAlarm}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            新增
          </button>
        </div>
      </div>

      {/* 鬧鐘列表 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">鬧鐘列表</h2>
        {alarms.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <AlarmClock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>尚未設定任何鬧鐘</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-white/10 border ${
                  alarm.active ? 'border-green-400' : 'border-white/30'
                }`}
              >
                <div className="flex items-center">
                  <div className={`text-2xl font-mono font-bold mr-3 ${
                    alarm.active ? 'text-green-300' : 'text-white/60'
                  }`}>
                    {alarm.time}
                  </div>
                  <div className="text-white/80">{alarm.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      alarm.active
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {alarm.active ? '關閉' : '開啟'}
                  </button>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 控制按鈕 */}
      <div className="flex gap-2">
        {isPlaying && (
          <button
            onClick={stopAlarm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <Volume2 className="w-5 h-5" />
            停止響鈴
          </button>
        )}
        <button
          onClick={resetAlarms}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          清空
        </button>
      </div>

      {/* 音頻元素（用於播放音效） */}
      <audio ref={audioRef} loop />
    </div>
  );
};

export default AlarmClock;