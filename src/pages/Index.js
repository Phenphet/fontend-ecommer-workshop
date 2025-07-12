import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import config from '../config'
import MyModal from '../components/MyModal'
import dayjs from 'dayjs'

function Index() {
    const [products, setProducts] = useState([])
    const [carts, setCarts] = useState([])
    const [recordIncarts, setRecordInCarts] = useState(0)
    const [sumQty, setSumQty] = useState(0)
    const [sumPrice, setSumPrice] = useState(0)
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [payDate, setPayDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
    const [patTime, setPayTime] = useState('')

    useEffect(() => {
        fetchData()
        fetchDataFromLocal()
    }, [])

    const fetchData = async () => {
        try {
            const res = await axios.get(config.apiPath + '/product/list')
            if (res.data.results !== undefined) {
                setProducts(res.data.results)
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const showImage = (item) => {
        if (item.img !== undefined) {
            let imgPath =  config.apiPath + '/uploads/' + item.img
            if (item.img === "") imgPath = "default_image.png"
            
            return <img className='card-img-top' src={imgPath} alt="" />
        }
        return <></>
    }

    const addToCart = (item) => {
        let arr = carts
        if (arr === null) {
            arr = []
        }
        arr.push(item)

        setCarts(arr)
        setRecordInCarts(arr.length)

        localStorage.setItem('carts', JSON.stringify(carts))

        fetchDataFromLocal()
    }

    const fetchDataFromLocal = () => {
        const itemInCarts = JSON.parse(localStorage.getItem('carts'))
        if(itemInCarts !== null){
            setCarts(itemInCarts)
            setRecordInCarts(itemInCarts !== null ? itemInCarts.length : 0)

            computePriceAndQty(itemInCarts)
        }
        
    }

    const computePriceAndQty = (itemIncarts) => {
        let sumQty = 0
        let sumPrice = 0

        for (let i = 0; i< itemIncarts.length; i++){
            const item = itemIncarts[i]
            sumQty++
            sumPrice+= parseInt(item.price)
        }

        setSumPrice(sumPrice)
        setSumQty(sumQty)
    }

    const handleRemove = async (item) => {
        try {
            const button = await Swal.fire({
                title: 'ลบสินค้า',
                text: 'คุณต้องการลบสินค้าออกจากตะกร้าใช่หรือไม่',
                icon: 'question',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed){
                let arr = carts

                for (let i = 0; i < arr.length; i++){
                    const itemInCarts = arr[i]

                    if(item.id === itemInCarts.id){
                        arr.splice(i, 1)
                    }
                }

                setCarts(arr)
                setRecordInCarts(arr.length)

                localStorage.setItem('carts', JSON.stringify(arr))
                
                computePriceAndQty(arr)
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    } 

    const handleSave = async () => {
        try {
           
            const payload = {
                customerName: customerName,
                customerPhone: customerPhone,
                customerAddress: customerAddress,
                payDate: payDate,
                payTime: patTime,
                carts: carts
            }

            const res = await axios.post(config.apiPath + '/api/sale/save', payload)

            if (res.data.message === 'success') {
                localStorage.removeItem('carts')
                setRecordInCarts(0)
                setCarts([])

                Swal.fire({
                    title: 'บันทึกข้อมูล',
                    text: 'ระบบได้บันทึกข้อมูลของคุณเเล้ว',
                    icon: 'success'
                })

                document.getElementById('modalCart_btnClose').click()

                setCustomerName('')
                setCustomerPhone('')
                setCustomerAddress('')
                setPayDate(dayjs(new Date()).format('YYYY-MM-DD'))
                setPayTime('')
            }
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }
    return <>
        <div className='container mt-3'>
            <div className='float-start'>
                <div className='h3'>สินค้าของร้านเรา</div>
            </div>
            <div className='float-end'>
                ตระกร้าของฉัน
                <button className='btn btn-outline-success ms-2 me-2' data-bs-toggle='modal' data-bs-target='#modalCart'>
                    <i className='fa fa-shopping-cart me-2'></i>
                    {recordIncarts}
                </button>
                ชิ้น
            </div>
            <div className='clearfix'></div>
            <div className='row'>
                {products.length > 0 ? products.map(item =>
                    <div className='col-3 mt-3' key={item.id}>
                        <div className='card'>
                            {showImage(item)}
                            <div className='card-body'>
                                <div>{item.name}</div>
                                <div>{item.price.toLocaleString('th-TH')}</div>
                                <div className='text-center'>
                                    <button className='btn btn-primary' onClick={e => addToCart(item)}>
                                        <i className='fa fa-shopping-cart me-2'></i>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : <></>}
            </div>
        </div>

        <MyModal id='modalCart' title='ตะกร้าสินค้าของฉัน'>
            <table className='table table-bordered table-striped'>
                <thead>
                    <tr>
                        <th>name</th>
                        <th className='text-end'>price</th>
                        <th className='text-end'>qty</th>
                        <th width='60px'></th>
                    </tr>
                </thead>
                <tbody>
                    {carts.length > 0 ? carts.map((item, index) => 
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td className='text-cent'>{item.price.toLocaleString('th-TH')}</td>
                            <td className='text-cent'>1</td>
                            <td className='text-center'>
                                <button className='btn btn-danger' onClick={e => handleRemove(item)}>
                                    <i className='fa fa-times'></i>
                                </button>
                            </td>
                        </tr>
                    ) : <></>}
                </tbody>
            </table>

            <div className='text-center'>
                จำนนวน {sumQty} รายการ เป็นเงิน {sumPrice.toLocaleString('th-TH')} บาท
            </div>

            <div className='mt-3'>
                <div className='alert alert-info'>
                    <div>โปรดโอนเงินไปยังบัญชี</div>
                    <div>กรุงไทย นาย ..... 888-000-99999</div>
                </div>
                <div className='mt-3'>
                    <div>ชื่อผู้ซื้อ</div>
                    <input className='form-control' onChange={e => setCustomerName(e.target.value)}/>
                </div> 
                <div className='mt-3'>
                    <div>เบอร์โทรติดต่อ</div>
                    <input className='form-control' onChange={e => setCustomerPhone(e.target.value)}/>
                </div> 
                <div className='mt-3'>
                    <div>ที่อยู่ที่จัดส่ง</div>
                    <input className='form-control' onChange={e => setCustomerAddress(e.target.value)}/>
                </div> 
                 <div className='mt-3'>
                    <div>วันที่โอน</div>
                    <input className='form-control' value={payDate} onChange={e => setPayDate(e.target.value)}/>
                </div> 
                <div className='mt-3'>
                    <div>เวลาที่โอนเงิน</div>
                    <input className='form-control' onChange={e => setPayTime(e.target.value)}/>
                </div> 
                <button className='btn btn-primary mt-3' onClick={handleSave}>
                    <i className='fa fa-check me-2'></i>
                    ยินยันการสั่งซื้อ
                </button>
            </div>
        </MyModal>
    </>
}

export default Index