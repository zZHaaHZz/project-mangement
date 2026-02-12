import React, { useState, useRef } from 'react'
import { Input, Button, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../lib/api'

const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Sử dụng AuthContext
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (success) return

    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      await register({
        name,
        email,
        password,
      })

      setSuccess(true)
      // Không navigate ngay để user xem thông báo success
      setName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err?.message || 'Đăng ký thất bại')
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h1>
      </div>

      <div className="mb-8">
        <p className="text-gray-600">Tạo tài khoản để bắt đầu sử dụng dịch vụ.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full" noValidate>
        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700">Tên tài khoản</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading || success}
            className="w-full"
            size="large"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
            className="w-full"
            size="large"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700">Mật khẩu</label>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || success}
            className="w-full"
            size="large"
          />
        </div>

        {!!error && (
          <Alert
            title={error}        // ✅ FIX: message -> title
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {success && (
          <Alert
            title="Đăng ký thành công!"
            description="Tài khoản của bạn đã được tạo. Vui lòng đợi Leader phê duyệt trước khi đăng nhập."
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        {!success ? (
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800"
            size="large"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-gray-600 text-sm mb-4">
              Bạn sẽ nhận được thông báo khi tài khoản được kích hoạt.
            </div>

            <Button
              type="default"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate('/login') // ✅ chuẩn key
              }}
              className="w-full"
              size="large"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        )}
      </form>

      {!success && (
        <div className="mt-6 text-center">
          <span className="text-gray-600">Bạn đã có tài khoản? </span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigate('/login') // ✅ chuẩn key
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Đăng nhập
          </a>
        </div>
      )}
    </div>
  )
}

export default Register
