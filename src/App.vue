<template>
  <div class="page">
    <div v-if="!loggedIn" class="auth-wrap">
      <div class="auth-card">
        <div class="auth-tabs">
          <button :class="['nav-btn', authMode === 'login' && 'active']" @click="authMode = 'login'">
            登录
          </button>
          <button :class="['nav-btn', authMode === 'register' && 'active']" @click="authMode = 'register'">
            注册
          </button>
        </div>
        <h2 class="auth-title">{{ authMode === 'login' ? '登录后进入秒杀商城' : '注册新账号' }}</h2>
        <form class="auth-form" @submit.prevent="authMode === 'login' ? doLogin() : doRegister()">
          <div class="target-switch">
            <button
              type="button"
              :class="['nav-btn', postLoginTarget === 'mall' && 'active']"
              @click="postLoginTarget = 'mall'"
            >
              登录后进入商城
            </button>
            <button
              type="button"
              :class="['nav-btn', postLoginTarget === 'admin' && 'active']"
              @click="postLoginTarget = 'admin'"
            >
              登录后进入后台
            </button>
          </div>
          <label v-if="authMode === 'login'">
            手机号
            <input v-model="loginForm.phone" class="input" placeholder="手机号" />
          </label>
          <label v-else>
            手机号
            <input v-model="registerForm.phone" class="input" placeholder="手机号" />
          </label>
          <label v-if="authMode === 'register'">
            昵称
            <input v-model="registerForm.name" class="input" placeholder="如：小明" />
          </label>
          <label v-if="authMode === 'login'">
            密码
            <input v-model="loginForm.password" class="input" type="password" placeholder="密码" />
          </label>
          <label v-else>
            密码
            <input v-model="registerForm.password" class="input" type="password" placeholder="密码" />
          </label>
          <button class="primary block" type="submit">{{ authMode === 'login' ? '登录' : '注册并登录' }}</button>
        </form>
        <p class="muted small">默认管理员：手机 18800000000 密码 123456</p>
        <p v-if="flash" class="muted small">{{ flash }}</p>
      </div>
    </div>
    <template v-else>
      <header class="topbar">
        <div class="brand">
          <span class="dot"></span>
          {{ isAdminView ? '后台管理' : '闪购商城' }}
        </div>
        <nav class="nav">
          <button
            v-for="tab in navTabs"
            :key="tab.key"
            :class="['nav-btn', view === tab.key && 'active']"
            @click="view = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
        <div class="user">
          <span class="role">{{ currentUser.role === 'admin' ? '管理员' : '用户' }}</span>
          <span class="name">{{ currentUser.name }}</span>
          <span class="divider">|</span>
          <span class="info">余额 ¥{{ currentUser.balance }}</span>
          <button v-if="isAdmin" class="ghost" @click="toggleAdminView">
            {{ isAdminView ? '返回商城' : '进入后台' }}
          </button>
          <button class="ghost" @click="logout">退出</button>
        </div>
      </header>

      <main v-if="!isAdminView" class="content">
        <div v-if="loading" class="loading">正在加载数据...</div>
        <section v-if="view === 'home'" class="panel hero">
          <div>
            <p class="eyebrow">高并发秒杀 / 低延迟 / 公平排队</p>
            <h1>在线秒杀商城前端演示</h1>
            <p class="desc">
              Vue 3 单页前端，包含秒杀专区、购物车、订单、用户中心与管理员秒杀配置的核心流程。
            </p>
          <div class="actions">
            <button class="primary" @click="view = 'seckill'">立即抢购</button>
            <button class="ghost" :disabled="!isAdmin" @click="goAdmin">进入后台</button>
          </div>
            <div class="stats">
              <div class="stat">
                <div class="stat-title">活跃秒杀</div>
                <div class="stat-value">{{ activeSeckillCount }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">今日下单</div>
                <div class="stat-value">{{ orders.length }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">库存总量</div>
                <div class="stat-value">{{ totalStock }} 件</div>
              </div>
            </div>
          </div>
          <div class="hero-card">
            <div class="badge">限时秒杀</div>
            <h3>{{ featuredEvent.title }}</h3>
            <p class="small">￥{{ featuredEvent.seckillPrice }} | 限购 {{ featuredEvent.limitPerUser }} 件</p>
            <p class="muted">开始时间：{{ formatDate(featuredEvent.startAt) }}</p>
            <p class="muted">结束时间：{{ formatDate(featuredEvent.endAt) }}</p>
            <button class="primary block" @click="handleSeckill(featuredEvent)">秒杀下单</button>
            <p class="countdown">倒计时：{{ countdownText(featuredEvent) }}</p>
          </div>
        </section>

        <section v-if="view === 'seckill'" class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Seckill Zone</p>
            <h2>秒杀专区</h2>
          </div>
          <p class="muted">随机排队 + 限购校验 + 库存实时扣减</p>
        </div>
        <div class="grid">
          <article v-for="event in seckillEvents" :key="event.id" class="card seckill-card">
            <div class="card-head">
              <div class="status" :class="statusClass(event)">{{ statusLabel(event) }}</div>
              <div class="limit">限购 {{ event.limitPerUser }} 件</div>
            </div>
            <div class="title-row">
              <h3>{{ event.title }}</h3>
              <span class="countdown">{{ countdownText(event) }}</span>
            </div>
            <p class="muted">{{ productName(event.productId) }}</p>
            <div class="price-row">
              <div class="seckill-price">¥{{ event.seckillPrice }}</div>
              <div class="origin">原价 ¥{{ productById(event.productId).price }}</div>
            </div>
            <div class="progress">
              <div class="progress-bar" :style="{ width: progress(event) }"></div>
            </div>
            <div class="meta">
              <span>剩余 {{ event.stock }} 件</span>
              <span>已抢 {{ event.sold }}</span>
            </div>
            <div class="card-actions">
              <button
                class="primary block"
                :disabled="!canSeckill(event)"
                @click="handleSeckill(event)"
              >
                {{ statusLabel(event) }}（限购 {{ event.limitPerUser }}）
              </button>
              <button
                class="ghost block"
                :disabled="!canSeckill(event)"
                @click="addSeckillToCart(event)"
              >
                加入购物车
              </button>
            </div>
          </article>
        </div>
      </section>

        <section v-if="view === 'products'" class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Catalog</p>
            <h2>商品列表</h2>
          </div>
          <input v-model="keyword" class="input" placeholder="搜索商品名称..." />
        </div>
        <div class="grid">
          <article v-for="item in filteredProducts" :key="item.id" class="card">
            <div class="tag">{{ item.tag }}</div>
            <h3>{{ item.name }}</h3>
            <p class="muted">{{ item.description }}</p>
            <div class="price-row">
              <div class="seckill-price">¥{{ item.price }}</div>
              <div class="origin">库存 {{ item.stock }}</div>
            </div>
            <button class="primary block" :disabled="item.stock <= 0" @click="addToCart(item)">
              加入购物车
            </button>
          </article>
        </div>
      </section>

        <section v-if="view === 'cart'" class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Checkout</p>
            <h2>购物车</h2>
          </div>
          <p class="muted">校验库存与限购，提交后生成订单并清空购物车</p>
        </div>
        <div v-if="cart.length" class="table">
          <div class="table-head">
            <span>名称</span>
            <span>类型</span>
            <span>数量</span>
            <span>单价</span>
            <span>小计</span>
          </div>
          <div v-for="item in cart" :key="item.key" class="table-row">
            <span>{{ item.name }}</span>
            <span>{{ item.type === 'seckill' ? '秒杀' : '普通' }}</span>
            <span>{{ item.qty }}</span>
            <span>¥{{ item.price }}</span>
            <span>¥{{ item.qty * item.price }}</span>
          </div>
          <div class="table-foot">
            <span>合计</span>
            <span class="total">¥{{ cartTotal }}</span>
            <button class="primary" @click="placeOrder">提交订单</button>
          </div>
        </div>
        <p v-else class="muted">购物车为空，去商品或秒杀页添加吧。</p>
      </section>

        <section v-if="view === 'orders'" class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Orders</p>
            <h2>订单列表</h2>
          </div>
          <p class="muted">模拟展示：订单号、金额、时间与包含的商品</p>
        </div>
        <div v-if="orders.length" class="order-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <header>
              <strong>#{{ order.id }}</strong>
              <span class="muted">{{ order.createdAt }}</span>
            </header>
            <p class="total">¥{{ order.total }}</p>
            <ul>
              <li v-for="line in order.items" :key="line.key">
                {{ line.name }} x {{ line.qty }}（{{ line.type === 'seckill' ? '秒杀' : '普通' }}）
              </li>
            </ul>
          </article>
        </div>
        <p v-else class="muted">暂无订单。</p>
      </section>
      </main>

      <main v-else class="content">
        <div v-if="loading" class="loading">正在加载数据...</div>
        <section v-if="view === 'admin'" class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Admin</p>
            <h2>管理员配置秒杀活动</h2>
          </div>
          <p class="muted">选择商品、设置时间、限购与库存，快速创建新活动</p>
        </div>
        <div class="form-grid">
          <label>
            活动名称
            <input v-model="form.title" class="input" placeholder="如：新春限时秒杀" />
          </label>
          <label>
            选择商品
            <select v-model.number="form.productId" class="input">
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </label>
          <label>
            秒杀价格
            <input v-model.number="form.seckillPrice" class="input" type="number" min="1" />
          </label>
          <label>
            限购数量/人
            <input v-model.number="form.limitPerUser" class="input" type="number" min="1" />
          </label>
          <label>
            库存
            <input v-model.number="form.stock" class="input" type="number" min="1" />
          </label>
          <label>
            开始时间
            <input v-model="form.startAt" class="input" type="datetime-local" />
          </label>
          <label>
            结束时间
            <input v-model="form.endAt" class="input" type="datetime-local" />
          </label>
          <div class="form-actions">
            <button class="primary" @click="createEvent">创建活动</button>
          </div>
        </div>
        <div class="grid">
          <article v-for="event in seckillEvents" :key="event.id" class="card">
            <h3>{{ event.title }}</h3>
            <p class="muted">商品：{{ productName(event.productId) }}</p>
            <p>价格 ¥{{ event.seckillPrice }} | 限购 {{ event.limitPerUser }}</p>
            <p>时间：{{ formatDate(event.startAt) }} - {{ formatDate(event.endAt) }}</p>
            <p>库存 {{ event.stock }} / 初始 {{ event.initialStock }}</p>
          </article>
        </div>
      </section>

      <section v-if="view === 'adminProducts'" class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Admin · Product</p>
            <h2>后台商品管理</h2>
          </div>
          <p class="muted">新增商品后可在秒杀活动中选择；当前仅内存保存，重启会重置</p>
        </div>
        <div class="form-grid">
          <label>
            商品名称
            <input v-model="productForm.name" class="input" placeholder="如：新品秒杀周边" />
          </label>
          <label>
            标签
            <input v-model="productForm.tag" class="input" placeholder="如：数码/居家" />
          </label>
          <label>
            描述
            <input v-model="productForm.description" class="input" placeholder="一句话简介" />
          </label>
          <label>
            价格
            <input v-model.number="productForm.price" class="input" type="number" min="0" />
          </label>
          <label>
            库存
            <input v-model.number="productForm.stock" class="input" type="number" min="0" />
          </label>
          <div class="form-actions">
            <button class="primary" @click="createProduct">新增商品</button>
          </div>
        </div>
        <div class="table">
          <div class="table-head">
            <span>名称</span>
            <span>标签</span>
            <span>库存</span>
            <span>价格</span>
            <span>描述</span>
          </div>
          <div v-for="p in products" :key="p.id" class="table-row">
            <span>{{ p.name }}</span>
            <span>{{ p.tag || '-' }}</span>
            <span>{{ p.stock }}</span>
            <span>¥{{ p.price }}</span>
            <span class="muted">{{ p.description || '-' }}</span>
          </div>
        </div>
      </section>
      </main>

      <div v-if="flash" class="toast">{{ flash }}</div>
    </template>
  </div>
</template>

<script>
import {
  addCart,
  buySeckill,
  checkout,
  createProduct,
  createSeckill,
  fetchSnapshot,
  getAuthToken,
  login,
  register,
  setAuthToken
} from './services/api'

export default {
  name: 'App',
  data() {
    const now = Date.now()
    return {
      view: 'home',
      loading: false,
      authMode: 'login',
      token: getAuthToken(),
      postLoginTarget: 'mall',
      loginForm: { phone: '18800000000', password: '123456' },
      registerForm: { name: '小明', phone: '', password: '' },
      mallTabs: [
        { key: 'home', label: '首页' },
        { key: 'seckill', label: '秒杀专区' },
        { key: 'products', label: '普通商品' },
        { key: 'cart', label: '购物车' },
        { key: 'orders', label: '订单' }
      ],
      adminTabs: [
        { key: 'admin', label: '后台-秒杀' },
        { key: 'adminProducts', label: '后台-商品' }
      ],
      currentUser: { name: '', role: 'user', balance: 0, phone: '' },
      products: [],
      seckillEvents: [],
      cart: [],
      orders: [],
      keyword: '',
      flash: '',
      seckillPurchases: {},
      timer: null,
      now,
      form: {
        title: '自定义秒杀',
        productId: null,
        seckillPrice: 199,
        limitPerUser: 1,
        stock: 10,
        startAt: new Date(now + 5 * 60 * 1000).toISOString().slice(0, 16),
        endAt: new Date(now + 35 * 60 * 1000).toISOString().slice(0, 16)
      },
      productForm: {
        name: '',
        tag: '',
        description: '',
        price: 99,
        stock: 10
      }
    }
  },
  computed: {
    loggedIn() {
      return !!this.token
    },
    isAdminView() {
      return this.view.startsWith('admin')
    },
    isAdmin() {
      return this.currentUser.role === 'admin'
    },
    navTabs() {
      if (this.isAdminView) {
        return this.isAdmin ? this.adminTabs : []
      }
      return this.mallTabs
    },
    totalStock() {
      return this.products.reduce((sum, p) => sum + p.stock, 0)
    },
    activeSeckillCount() {
      return this.seckillEvents.filter((e) => this.statusLabel(e) === '进行中').length
    },
    filteredProducts() {
      const key = this.keyword.trim()
      if (!key) return this.products
      return this.products.filter((p) => p.name.includes(key) || p.description?.includes(key))
    },
    cartTotal() {
      return this.cart.reduce((sum, item) => sum + item.qty * item.price, 0)
    },
    featuredEvent() {
      if (!this.seckillEvents.length) {
        return {
          id: 'placeholder',
          title: '暂无活动',
          productId: null,
          seckillPrice: '-',
          limitPerUser: 0,
          startAt: this.now,
          endAt: this.now,
          stock: 0,
          sold: 0,
          initialStock: 0
        }
      }
      return this.seckillEvents.find((e) => this.canSeckill(e)) || this.seckillEvents[0]
    }
  },
  mounted() {
    if (this.loggedIn) {
      this.bootstrap()
    }
    this.timer = setInterval(() => {
      this.now = Date.now()
    }, 1000)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    async doLogin() {
      try {
        const res = await login(this.loginForm)
        this.applyAuth(res)
        await this.bootstrap()
        this.enterAfterLogin()
      } catch (error) {
        this.handleError(error)
      }
    },
    async doRegister() {
      try {
        const res = await register(this.registerForm)
        this.applyAuth(res)
        await this.bootstrap()
        this.enterAfterLogin()
        this.notify('注册成功，已登录')
      } catch (error) {
        this.handleError(error)
      }
    },
    logout() {
      setAuthToken('')
      this.token = ''
      this.currentUser = { name: '', role: 'user', balance: 0, phone: '' }
      this.products = []
      this.seckillEvents = []
      this.cart = []
      this.orders = []
      this.seckillPurchases = {}
      this.view = 'home'
      this.postLoginTarget = 'mall'
      this.notify('已退出登录')
    },
    enterAfterLogin() {
      if (this.postLoginTarget === 'admin') {
        if (this.isAdmin) {
          this.view = 'admin'
        } else {
          this.view = 'home'
          this.notify('当前账号非管理员，已进入商城')
        }
      } else {
        this.view = 'home'
      }
    },
    async createProduct() {
      if (!this.productForm.name) {
        this.notify('请填写商品名称')
        return
      }
      try {
        const snapshot = await createProduct(this.productForm)
        this.applySnapshot(snapshot)
        this.productForm = { name: '', tag: '', description: '', price: 99, stock: 10 }
        this.notify('已添加商品')
      } catch (error) {
        this.handleError(error)
      }
    },
    applyAuth(res) {
      this.token = res.token
      setAuthToken(res.token)
      if (res.user) {
        this.currentUser = res.user
      }
    },
    async bootstrap() {
      if (!this.loggedIn) return
      try {
        this.loading = true
        const snapshot = await fetchSnapshot()
        this.applySnapshot(snapshot, { notifyMessage: false })
      } catch (error) {
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },
    applySnapshot(snapshot, options = { notifyMessage: true }) {
      this.currentUser = snapshot.user || this.currentUser
      this.products = snapshot.products || []
      this.seckillEvents = snapshot.seckillEvents || []
      this.cart = snapshot.cart || []
      this.orders = snapshot.orders || []
      this.seckillPurchases = snapshot.seckillPurchases || {}
      if (!this.form.productId && this.products.length) {
        this.form.productId = this.products[0].id
      }
      if (!this.productForm.tag && this.products.length) {
        this.productForm.tag = this.products[0].tag || ''
      }
      if (!this.form.startAt) {
        this.resetFormTimes()
      }
      if (options.notifyMessage && snapshot.message && snapshot.message !== 'ok') {
        this.notify(snapshot.message)
      }
    },
    productById(id) {
      return this.products.find((p) => p.id === id) || { price: 0, name: '', description: '' }
    },
    productName(id) {
      return this.productById(id).name
    },
    reservedInCart(eventId) {
      return this.cart
        .filter((item) => item.eventId === eventId)
        .reduce((sum, item) => sum + item.qty, 0)
    },
    statusLabel(event) {
      if (this.now < event.startAt) return '未开始'
      if (this.now > event.endAt) return '已结束'
      if (event.stock <= 0) return '已售罄'
      return '进行中'
    },
    statusClass(event) {
      const status = this.statusLabel(event)
      if (status === '进行中') return 'tag success'
      if (status === '未开始') return 'tag warning'
      return 'tag muted'
    },
    countdownText(event) {
      const diff = this.now < event.startAt ? event.startAt - this.now : event.endAt - this.now
      return diff > 0 ? this.formatCountdown(diff) : '00:00'
    },
    progress(event) {
      const total = event.initialStock || event.stock + event.sold || 1
      const percent = Math.min(100, Math.round((event.sold / total) * 100))
      return `${percent}%`
    },
    formatCountdown(ms) {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000))
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
      const s = String(totalSeconds % 60).padStart(2, '0')
      return `${h}:${m}:${s}`
    },
    formatDate(ts) {
      if (!ts) return '-'
      const date = new Date(ts)
      if (Number.isNaN(date.getTime())) return '-'
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${mm}`
    },
    notify(msg) {
      this.flash = msg
      setTimeout(() => {
        this.flash = ''
      }, 2000)
    },
    handleError(error) {
      if (error?.status === 401) {
        this.logout()
        this.notify(error.message || '登录失效，请重新登录')
        return
      }
      this.notify(error?.message || '请求失败')
    },
    canSeckill(event) {
      const status = this.statusLabel(event)
      if (status !== '进行中') return false
      const purchased = this.seckillPurchases[event.id] || 0
      const reserved = this.reservedInCart(event.id)
      return purchased + reserved < event.limitPerUser
    },
    goAdmin() {
      if (!this.isAdmin) {
        this.notify('当前账号非管理员')
        return
      }
      this.view = 'admin'
    },
    toggleAdminView() {
      if (!this.isAdmin) {
        this.notify('当前账号非管理员')
        return
      }
      this.view = this.isAdminView ? 'home' : 'admin'
    },
    async handleSeckill(event) {
      if (!this.canSeckill(event)) {
        this.notify('活动未开始或已结束或已达限购')
        return
      }
      try {
        const snapshot = await buySeckill(event.id, 1)
        this.applySnapshot(snapshot)
        this.view = 'orders'
      } catch (error) {
        this.handleError(error)
      }
    },
    async addSeckillToCart(event) {
      await this.addToCart(this.productById(event.productId), { type: 'seckill', event })
    },
    async addToCart(product, options = {}) {
      const isSeckill = options.type === 'seckill'
      const payload = isSeckill
        ? { type: 'seckill', eventId: options.event.id, qty: 1 }
        : { type: 'normal', productId: product.id, qty: 1 }
      try {
        const snapshot = await addCart(payload)
        this.applySnapshot(snapshot)
        this.notify('已加入购物车')
      } catch (error) {
        this.handleError(error)
      }
    },
    async placeOrder() {
      try {
        const snapshot = await checkout()
        this.applySnapshot(snapshot)
        this.view = 'orders'
      } catch (error) {
        this.handleError(error)
      }
    },
    async createEvent() {
      const product = this.productById(this.form.productId)
      if (!product.name) {
        this.notify('请选择商品')
        return
      }
      const payload = {
        title: this.form.title || `${product.name} 秒杀`,
        productId: this.form.productId,
        seckillPrice: this.form.seckillPrice,
        limitPerUser: this.form.limitPerUser,
        stock: this.form.stock,
        startAt: new Date(this.form.startAt).getTime(),
        endAt: new Date(this.form.endAt).getTime()
      }
      try {
        const snapshot = await createSeckill(payload)
        this.applySnapshot(snapshot)
        this.resetFormTimes()
        this.notify('已创建新秒杀活动')
      } catch (error) {
        this.handleError(error)
      }
    },
    resetFormTimes() {
      const start = new Date(Date.now() + 5 * 60 * 1000)
      const end = new Date(Date.now() + 35 * 60 * 1000)
      this.form.startAt = start.toISOString().slice(0, 16)
      this.form.endAt = end.toISOString().slice(0, 16)
    }
  }
}
</script>

<style>
:root {
  --bg: #0d1117;
  --panel: #111827;
  --muted: #8b949e;
  --primary: #ff6b6b;
  --accent: #6c5ce7;
  --border: #1f2937;
  --card: #0f172a;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: radial-gradient(circle at 20% 20%, #1f2937, #0b0f17 40%);
  background-attachment: fixed;
  color: #e5e7eb;
  font-family: 'Inter', 'SF Pro Display', 'PingFang SC', Arial, sans-serif;
}

.page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.page::before,
.page::after {
  content: '';
  position: absolute;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.45;
  z-index: 0;
  pointer-events: none;
}

.page::before {
  background: #6c5ce7;
  top: -120px;
  left: -60px;
}

.page::after {
  background: #ff6b6b;
  bottom: -120px;
  right: -40px;
}

.auth-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: min(420px, 100%);
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  animation: fadeIn 0.4s ease;
}

.auth-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.auth-title {
  margin: 8px 0 16px;
}

.auth-form {
  display: grid;
  gap: 12px;
}

.target-switch {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.35);
}

.brand {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #ffa94d);
  display: inline-block;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-btn {
  background: #0b1324;
  color: #cbd5e1;
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  border-color: var(--primary);
  color: #fff;
}

.nav-btn.active {
  background: linear-gradient(135deg, var(--primary), #ffa94d);
  color: #0b0f17;
  border-color: transparent;
}

.user {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #cbd5e1;
}

.role {
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.divider {
  color: var(--muted);
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 64px;
}

.panel {
  background: rgba(17, 24, 39, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.04), transparent 40%);
  pointer-events: none;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  align-items: center;
}

.hero h1 {
  margin: 4px 0 12px;
  font-size: 32px;
}

.hero .desc {
  color: var(--muted);
  margin: 0 0 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: 12px;
}

.stat-title {
  color: var(--muted);
  font-size: 12px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
}

.hero-card {
  background: linear-gradient(160deg, rgba(20, 26, 47, 0.95), rgba(12, 18, 36, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.badge {
  display: inline-block;
  background: rgba(255, 107, 107, 0.2);
  color: #ffc2c2;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.muted {
  color: var(--muted);
}

.small {
  margin: 8px 0 12px;
  color: #e5e7eb;
}

.countdown {
  color: #9ca3af;
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
}

.seckill-price {
  font-size: 22px;
  font-weight: 700;
  color: #ffb347;
}

.origin {
  color: var(--muted);
  text-decoration: line-through;
}

.progress {
  width: 100%;
  height: 8px;
  background: #1f2937;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #ffa94d);
}

.meta {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.primary {
  background: linear-gradient(135deg, var(--primary), #ffa94d);
  border: none;
  color: #0b0f17;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(255, 107, 107, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(255, 107, 107, 0.4);
}

.ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: #e5e7eb;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.ghost:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: translateY(-1px);
}

.ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.block {
  width: 100%;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: #9ca3af;
  font-size: 12px;
}

.tag.success {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.tag.warning {
  background: rgba(250, 204, 21, 0.1);
  color: #facc15;
}

.tag.muted {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.limit {
  font-size: 12px;
  color: var(--muted);
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #0b1324;
  color: #e5e7eb;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

.table {
  background: #0b1324;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.table-head {
  font-weight: 700;
}

.table-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
}

.total {
  font-size: 20px;
  font-weight: 700;
}

.order-list {
  display: grid;
  gap: 10px;
}

.order-card {
  background: #0c1224;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.order-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.08);
}

.order-card header {
  display: flex;
  justify-content: space-between;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading {
  background: #0b1324;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, var(--primary), #ffa94d);
  color: #0b0f17;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.25s ease;
}

.eyebrow {
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  font-size: 12px;
  margin: 0;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .topbar {
    flex-wrap: wrap;
    gap: 12px;
  }
  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
