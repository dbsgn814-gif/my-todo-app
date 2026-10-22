// 앱 진입점
function initApp() {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const count = document.getElementById('todo-count');
  const clearBtn = document.getElementById('clear-completed');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const STORAGE_KEY = 'todos';

  // 필터별로 목록이 비었을 때 보여 줄 안내 문구
  const EMPTY_MESSAGES = {
    all: '아직 할 일이 없어요. 위에서 추가해 보세요!',
    active: '진행중인 할 일이 없어요.',
    completed: '완료된 할 일이 없어요.',
  };

  // 저장된 할 일을 불러옴 (없거나 손상됐으면 빈 배열)
  function loadTodos() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  // 현재 할 일 배열을 LocalStorage에 저장
  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 메모리에만 유지
    }
  }

  let todos = loadTodos();
  // 불러온 항목과 id가 겹치지 않도록 가장 큰 id 다음 번호부터 사용
  let nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
  // 현재 선택된 필터: 'all' | 'active' | 'completed'
  let currentFilter = 'all';

  // 전체/완료 개수 표시와 일괄 삭제 버튼 상태를 갱신
  function renderCount() {
    const doneCount = todos.filter((todo) => todo.completed).length;
    count.textContent = `전체 ${todos.length}개 · 완료 ${doneCount}개`;
    clearBtn.disabled = doneCount === 0;
  }

  // 선택된 필터 버튼만 강조
  function renderFilters() {
    filterBtns.forEach((btn) => {
      const isActive = btn.dataset.filter === currentFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    list.dataset.empty = EMPTY_MESSAGES[currentFilter];
  }

  // 현재 필터에 맞는 항목만 골라냄
  function getVisibleTodos() {
    if (currentFilter === 'active') return todos.filter((todo) => !todo.completed);
    if (currentFilter === 'completed') return todos.filter((todo) => todo.completed);
    return todos;
  }

  // 배열 내용대로 목록을 다시 그리고 저장
  function render() {
    saveTodos();
    renderCount();
    renderFilters();
    list.innerHTML = '';

    getVisibleTodos().forEach((todo) => {
      const item = document.createElement('li');
      item.className = 'todo-item';
      item.classList.toggle('completed', todo.completed);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', '완료 표시');
      checkbox.addEventListener('change', () => toggleTodo(todo.id));

      // 사용자가 입력한 글자는 textContent로 넣어 HTML로 해석되지 않게 함
      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'todo-delete';
      deleteBtn.textContent = '✕';
      deleteBtn.setAttribute('aria-label', '삭제');
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      item.append(checkbox, text, deleteBtn);
      list.appendChild(item);
    });
  }

  function addTodo(text) {
    todos.push({ id: nextId++, text, completed: false });
    render();
  }

  function toggleTodo(id) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    render();
  }

  // 완료된 항목을 한꺼번에 삭제
  function clearCompleted() {
    todos = todos.filter((todo) => !todo.completed);
    render();
  }

  // 같은 내용의 할 일이 이미 있는지 확인 (앞뒤 공백 제외, 완료 여부와 관계없이)
  function isDuplicate(text) {
    return todos.some((todo) => todo.text === text);
  }

  // 폼 제출은 추가 버튼 클릭과 Enter 키 입력 모두에서 발생
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = input.value.trim();
    if (text === '') {
      alert('할 일을 입력하세요');
      input.focus();
      return;
    }

    if (isDuplicate(text)) {
      alert('이미 등록된 할 일입니다');
      input.focus();
      return;
    }

    addTodo(text);
    input.value = '';
    input.focus();
  });

  // 필터 버튼 클릭 시 해당 항목만 표시
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener('click', clearCompleted);

  // 처음 열 때 저장된 목록을 화면에 표시
  render();
}

document.addEventListener('DOMContentLoaded', initApp);
