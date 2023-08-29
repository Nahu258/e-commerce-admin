import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Spinner from './Spinner'
import { ReactSortable } from 'react-sortablejs'

export default function ProductForm ({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties
}) {
  const [title, setTitle] = useState(existingTitle || '')
  const [description, setDescription] = useState(existingDescription || '')
  const [price, setPrice] = useState(existingPrice || '')
  const [images, setImages] = useState(existingImages || [])
  const [category, setCategory] = useState(existingCategory || '')
  const [productProperties, setProductProperties] = useState(existingProperties || {})

  const [categories, setCategories] = useState([])

  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    axios.get('/api/categories').then(response => {
      setCategories(response.data)
    })
  }, [])

  const saveProduct = async (e) => {
    e.preventDefault()
    const data = { title, description, price, images, category, properties: productProperties }

    if (_id) {
      // UPDATE
      await axios.put('/api/products', { ...data, _id }).then(router.push('/products'))
    } else {
      // CREATE
      await axios.post('/api/products', data).then(router.push('/products'))
    }
  }

  const uploadImages = async (e) => {
    const files = e.target?.files
    if (files?.length > 0) {
      setIsUploading(true)
      const data = new FormData()

      for (const file of files) {
        data.append('file', file)
      }
      const res = await axios.post('/api/upload', data)
      setImages(oldImages => {
        return [...oldImages, ...res.data.links]
      })
      setIsUploading(false)
    }
  }

  const updateImagesOrder = (images) => {
    setImages(images)
  }

  const setProductProp = (propName, value) => {
    setProductProperties(prev => {
      const newProductProps = { ...prev }
      newProductProps[propName] = value
      return newProductProps
    })
  }

  const propertiesToFill = []
  if (categories.length > 0 && category) {
    let categoryInfo = categories.find(({ _id }) => _id === category)
    propertiesToFill.push(...categoryInfo.properties)

    while (categoryInfo?.parent?._id) {
      const parentCategory = categories.find(({ _id }) => _id === categoryInfo?.parent?._id)
      propertiesToFill.push(...parentCategory.properties)
      categoryInfo = parentCategory
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input type='text' placeholder='product name' value={title} onChange={event => setTitle(event.target.value)} />
      <label>Category</label>
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value=''>Uncategorized</option>
        {categories.length > 0 && categories.map(category => (
          <option key={category._id} value={category._id}>{category.name}</option>
        ))}
      </select>
      {propertiesToFill.length > 0 && propertiesToFill.map((p, index) => (
        <div className='' key={index}>
          <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
          <div>
            <select value={productProperties[p.name]} onChange={event => setProductProp(p.name, event.target.value)}>
              {p.values.map((value, index) => (
                <option key={index} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <label>Photos</label>
      <div className='mb-2 flex flex-wrap gap-1'>
        <ReactSortable className='flex flex-wrap gap-1' list={images} setList={updateImagesOrder}>
          {!!images?.length && images.map(link => (
            <div key={link} className='h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200'>
              <img src={link} alt='A product image' className='rounded-lg' />
            </div>
          ))}
        </ReactSortable>
        {isUploading && (
          <div className='h-24 flex items-center'>
            <Spinner />
          </div>
        )}
        <label className='cursor-pointer w-24 h-24 flex flex-col text-center justify-center items-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary'>
          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor' className='w-6 h-6'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' />
          </svg>
          <div>
            Add image
          </div>
          <input type='file' className='hidden' onChange={uploadImages} />
        </label>
      </div>
      <label>Description</label>
      <textarea placeholder='description' value={description} onChange={event => setDescription(event.target.value)} />
      <label>Price (in USD)</label>
      <input type='number' placeholder='price' value={price} onChange={event => setPrice(event.target.value)} />
      <button className='btn-primary' type='submit'>Save</button>
    </form>
  )
}
