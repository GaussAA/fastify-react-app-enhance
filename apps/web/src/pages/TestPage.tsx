/**
 * 测试页面 - 用于调试页面空白问题
 */

export function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">测试页面</h1>
        <p className="text-white/80 mb-8">
          如果你能看到这个页面，说明基本渲染正常
        </p>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            液态玻璃效果测试
          </h2>
          <p className="text-white/90 mb-4">这是一个简单的液态玻璃卡片</p>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            测试按钮
          </button>
        </div>
      </div>
    </div>
  );
}
