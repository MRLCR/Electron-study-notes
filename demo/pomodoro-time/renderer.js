const {ipcRenderer} = require('electron');
const ProgressBar = require('progressbar.js/dist/progressbar');
const Timer = require('timer.js');

const config = {
  workTime: 6, // 工作时间
  restTime: 3, // 休息时间
}
const state = stateFactory(config); // 当前状态

const progressBar = new ProgressBar.Circle('#timer-container', {
  strokeWidth: 2,
  color: '#F44336',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: null
});

function stateFactory(config) {
  const stateTypeFactory = (value, btnText, time = 0) => ({
    value, btnText, time
  });
  const types = {
    rested: stateTypeFactory(0, '开始工作'),
    working: stateTypeFactory(1, '停止工作', config.workTime),
    worked: stateTypeFactory(2, '开始休息'),
    resting: stateTypeFactory(3, '停止休息', config.restTime),
  }

  let _type = types.rested;
  let _time = 0;

  return {
    types,
    getCurType() {
      return _type;
    },
    updated(time) {
      _time = typeof time === 'number' ? time : Number(time);
    },
    change(type) {
      if (types[type]) {
        _type = type;
        this.render();
      }
    },
    render() {
      console.log('start render');
      const maxTime = _type.time;
      const ss = _time % 60;
      const mm = Math.floor((s - ss) / 60);
      const format = (num) => num.toString().padStart(2, '0');
    
      progressBar.set(1 - _time / maxTime);
      progressBar.setText(`${format(mm)}:${format(ss)}`);
console.log('btnText:', _type.btnText);
      switchButtonEle.innerText = _type.btnText;
    }
  }
}

const workTimer = new Timer({
  ontick: (ms) => state.updated(ms / 1000),
  onstop: () => state.change(state.types.working),
  onend() {
    const curType = state.getCurType();

    if (curType === state.types.working) {
      state.change(state.types.worked);
      notification({
        title: '恭喜你完成任务', 
        body: '是否开始休息？',
        actionText: '休息五分钟',
        closeButtonText: '继续工作',
        onaction: startRest,
        onclose: startWork
      });
    } else if (curType === state.types.resting) {
      state.change(state.types.rested);
      notification({
        body: '开始新的工作吧!',
        title: '休息结束', 
        closeButtonText: '继续休息',
        actionText: '开始工作',
        onaction: startWork,
        onclose: startRest
      })
    }
  }
})

async function notification({
  title,
  body,
  actionText,
  closeButtonText,
  onclose,
  onaction,
} = {}) {
  // mac 系统
  if(process.platform === 'darwin') {
    let res = await ipcRenderer.invoke('notification', {
      title,
      body, 
      actions: [{text: actionText, type: 'button'}],
      closeButtonText
    })
    try {
      res.event === 'close' ? onclose() : onaction()
    } catch(e) {
      console.log(e);
    }
  } else {
    alert(body);
  }
}

function startWork() {
  state.change(state.types.working);
  workTimer.start(config.workTime);
}

function startRest() {
  state.change(state.types.resting);
  workTimer.start(config.restTime);
}


const switchButtonEle = document.getElementById('switch-button');
switchButtonEle.onclick = function() {
  const curType = state.getCurType;
  if (curType === state.types.working) {
    startWork()
  } else if (curType === state.types.resting) {
    startRest();
  } else {
    workTimer.stop();
  }
}

state.render();
