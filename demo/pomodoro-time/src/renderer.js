const { ipcRenderer } = require('electron');
const ProgressBar = require('progressbar.js/dist/progressbar');
const Timer = require('timer.js');
const { formatDate } = require('./utils');
const config = require('./config');


const state = stateFactory(config); // 当前状态
const log = logFactory(); // 作息日志记录
const progressBar = new ProgressBar.Circle('#timer-container', {
  strokeWidth: 2,
  color: '#f44336',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: null
});

function stateFactory(config) {
  const stateTypeFactory = (value, btnText, time = 0) => ({
    value, btnText, time,
    valueOf() {
      this.value;
    },
  });
  const types = {
    rested: stateTypeFactory(0, '开始工作'),
    working: stateTypeFactory(1, '停止工作', config.workTime),
    worked: stateTypeFactory(2, '开始休息'),
    resting: stateTypeFactory(3, '停止休息', config.restTime),
  }

  // add name
  Object.keys(types).forEach(key => {
    types[key]['name'] = key;
  });

  let _curType = types.rested;

  return {
    types,
    getCurType() {
      return _curType.value;
    },
    updated(time) {
      const _time = typeof time === 'number' ? time : Number(time);
      this.renderClock(_time);
    },
    change(type) {
      if (types[type.name]) {
        _curType = type;
        this.renderBtn();
      }
    },
    renderBtn() {
      switchButtonEle.innerText = _curType.btnText;
    },
    renderClock(s = 0) {
      const ss = s % 60;
      const mm = ((s - ss) / 60);
      const format = (num) => num.toFixed(0).padStart(2, '0');
    
      progressBar.set(1 - s / _curType.time);
      progressBar.setText(`${format(mm)}:${format(ss)}`);
    },
    render(s = 0) {
      this.renderBtn();
      this.renderClock(s);
    },
  }
}

function logFactory() {
  const _log = [];

  return {
    get() {
      return _log;
    },
    print() {
      return _log.join('\n');
    },
    record(text) {
      _log.push(`${text}: ${formatDate(new Date().getTime())}`);
    },
  }
}

const workTimer = new Timer({
  ontick: ms => state.updated(ms / 1000),
  onstop: () => state.change(state.types.working),
  onend() {
    const curType = state.getCurType();

    if (curType === state.types.working.value) {
      state.change(state.types.worked);
      notification({
        title: '恭喜你完成任务', 
        body: '是否开始休息？',
        actionText: '休息五分钟',
        closeButtonText: '继续工作',
        onAction: startRest,
        onClose: startWork
      });
    } else if (curType === state.types.resting.value) {
      state.change(state.types.rested);
      notification({
        body: '开始新的工作吧!',
        title: '休息结束', 
        closeButtonText: '继续休息',
        actionText: '开始工作',
        onAction: startWork,
        onClose: startRest
      })
    }
  }
})

async function notification({
  title,
  body,
  actionText,
  closeButtonText,
  onClose,
  onAction,
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
      res.event === 'close' ? onClose() : onAction()
    } catch(e) {
      console.log(e);
    }
  } else {
    alert(body);
  }
}

function startWork() {
  state.change(state.types.working);
  log.record(state.types.working.btnText);
  workTimer.start(config.workTime);
}

function stopWork() {
  workTimer.stop();
  startRest();
}

function startRest() {
  state.change(state.types.resting);
  log.record(state.types.resting.btnText);
  workTimer.start(config.restTime);
}

function stopRest() {
  workTimer.stop();
  startWork();
}


const switchButtonEle = document.getElementById('switch-button');

switchButtonEle.onclick = function() {
  const curType = state.getCurType();
  if (curType === state.types.rested.value) {
    startWork()
  } else if (curType === state.types.worked.value) {
    startRest();
  } else if (curType === state.types.working.value){
    stopWork();
  } else if (curType === state.types.resting.value) {
    stopRest();
  } else {
    workTimer.stop();
  }
}

state.render(0);
document.getElementById('log-button').addEventListener('click', () => {
  document.getElementById('log').innerText = log.print();
});
