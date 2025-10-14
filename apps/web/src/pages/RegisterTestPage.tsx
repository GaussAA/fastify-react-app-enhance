/**
 * 注册页面测试 - 用于调试注册页面问题
 */

export function RegisterTestPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                backgroundImage: "url('/images/auth/register-bg.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* 背景遮罩层 */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-pink-900/10 to-indigo-900/15" />

            {/* 背景装饰元素 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/5 to-purple-400/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* 标题区域 */}
                <div className="text-center mb-8 p-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">创建账户</h1>
                    <p className="text-white/90 drop-shadow-md">注册新账户以开始使用我们的服务</p>
                </div>

                {/* 简单表单测试 */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                    <h2 className="text-2xl font-bold text-center text-white drop-shadow-lg mb-4">注册测试</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white drop-shadow-sm mb-2">姓名</label>
                            <input
                                type="text"
                                placeholder="请输入您的姓名"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                            />
                        </div>

                        <div>
                            <label className="block text-white drop-shadow-sm mb-2">邮箱</label>
                            <input
                                type="email"
                                placeholder="请输入邮箱地址"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                            />
                        </div>

                        <div>
                            <label className="block text-white drop-shadow-sm mb-2">密码</label>
                            <input
                                type="password"
                                placeholder="请输入密码"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                            />
                        </div>

                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            注册
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

