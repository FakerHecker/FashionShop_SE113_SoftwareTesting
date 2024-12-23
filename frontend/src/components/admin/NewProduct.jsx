import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/api/productsApi";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_COLORS,
  PRODUCT_SIZES,
  PRODUCT_SUBCATEGORIES,
  PRODUCT_SUBSUBCATEGORIES,
} from "../../constants/constants";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const initialProductState = () => ({
  productID: "",
  name: "",
  description: "",
  origin: "",
  price: "",
  category: {
    name: "",
    subCategory: "",
    subSubCategory: "",
  },
  variants: [{ color: "", size: "", stock: "" }],
  visible: false,
  
}); // ulitize code 2 places in component

const NewProduct = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState(initialProductState);
  const [tempProductID, setTempProductID] = useState("");

  const [createProduct, { isLoading, error, isSuccess }] =
    useCreateProductMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
      // navigate("/admin/products");
    }

    if (isSuccess) {
      // toast.success("Sản phẩm đã được tạo");
      // navigate("/admin/products");
      console.log("productID", product.productID);
      confirmAlert({
        title: "Thành công",
        message: "Tạo sản phẩm mới thành công. Bạn có muốn chuyển hướng trang quản lý sản phẩm?",
        buttons: [
          {
            label: "Có",
            onClick: () => navigate(`/admin/products?productId=${tempProductID}`)
          },
          {
            label: "Không",
            onClick: () => setProduct(initialProductState)
          }
        ]
      })
    }
  }, [error, isSuccess]);

  const { productID, name, description, origin, price, category, variants, visible } =
    product;

  const onChange = (e) => {
    const { name, type, checked } = e.target;
    if (e.target.name.startsWith("variants")) {
      const [_, field, variantIndex] = e.target.name.split(".");
      const updatedVariants = [...product.variants];
      updatedVariants[variantIndex][field] = e.target.value;
      setProduct({ ...product, variants: updatedVariants });
    } else if (e.target.name.includes("category")) {
      const categoryField = e.target.name.split(".")[1];
      setProduct({
        ...product,
        category: { ...product.category, [categoryField]: e.target.value },
      });
    } else if (type === "checkbox") {
      setProduct({ ...product, [name]: checked });
    } else {
      setProduct({ ...product, [e.target.name]: e.target.value });
    }
  };

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [...product.variants, { color: "", size: "", stock: "" }],
    });
  };

  function removeVariant(index) {
    // Tạo một mảng mới không bao gồm biến thể với chỉ số được cung cấp
    const newVariants = product.variants.filter(
      (_, variantIndex) => variantIndex !== index
    );
    // Cập nhật trạng thái của sản phẩm với mảng biến thể mới
    setProduct({ ...product, variants: newVariants });
  }

  // Function kiểm trùng variants
  const hasDuplicateVariants = (variants) => {
    const variantPairs = {};
    for (const variant of variants) {
      const key = `${variant.color}-${variant.size}`;
      if (variantPairs[key]) {
        return true; // Duplicate found
      }
      variantPairs[key] = true;
    }
    return false; // No duplicates found
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (hasDuplicateVariants(product.variants)) {
      toast.error(
        "Có lỗi: Trùng lặp các cặp màu sắc và kích cỡ. Vui lòng kiểm tra lại."
      );
      return;
    } // Kiểm tra trùng biến thể (màu và kích cỡ)

    const validateProduct = () => {
      if (!product.productID || product.productID.trim() === "") {
        return "Mã sản phẩm không được để trống.";
      }
      if (!product.name || product.name.trim() === "") {
        return "Tên sản phẩm không được để trống.";
      }
      if (!product.description || product.description.trim() === "") {
        return "Mô tả sản phẩm không được để trống.";
      }
      if (!product.origin || product.origin.trim() === "") {
        return "Xuất xứ sản phẩm không được để trống.";
      }
      if (
        !product.price ||
        isNaN(product.price) ||
        parseFloat(product.price) <= 0
      ) {
        return "Giá sản phẩm phải là một số hợp lệ và lớn hơn 0.";
      }
      if (
        !product.category ||
        !product.category.name ||
        product.category.name.trim() === ""
      ) {
        return "Danh mục sản phẩm không được để trống.";
      }
      if (
        !product.category.subCategory ||
        product.category.subCategory.trim() === "" ||
        product.category.subCategory === "Vui lòng chọn"
      ) {
        return "Danh mục phụ không được để trống và không được chọn 'Vui lòng chọn'.";
      }
      if (
        !product.category.subSubCategory ||
        product.category.subSubCategory.trim() === "" ||
        product.category.subSubCategory === "Vui lòng chọn"
      ) {
        return "Danh mục con không được để trống và không được chọn 'Vui lòng chọn'.";
      }
      if (
        !product.variants ||
        product.variants.length === 0 ||
        product.variants.some(
          (variant) =>
            !variant.color ||
            !variant.size ||
            !variant.stock ||
            isNaN(variant.stock) ||
            parseInt(variant.stock) < 0
        )
      ) {
        return "Danh sách biến thể phải có ít nhất một mục hợp lệ (đủ màu, kích cỡ và số lượng tồn kho).";
      }
      return null;
    };

  const errorMessage = validateProduct();
  if (errorMessage) {
    toast.error(errorMessage);
    return;
  }
  
    console.log(product);
    setTempProductID(product.productID);
    createProduct(product);
    // setProduct(initialProductState); // clear fields after successful creation
  };

  return (
    <AdminLayout>
      <MetaData title={"Tạo Sản phẩm mới"} />
      <div className="row wrapper">
        <div className="col-11 col-lg-10 mt-5 mt-lg-0">
          <form className="shadow rounded bg-body" onSubmit={submitHandler}>
            <h2 className="mb-4">Sản phẩm mới</h2>
            <div className="row">
              <div className="mb-3 col-12 col-md-3">
                <label htmlFor="productID_field" className="form-label">
                  Mã ID
                </label>
                <input
                  type="text"
                  id="productID_field"
                  className="form-control"
                  name="productID"
                  value={productID}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3 col-12 col-md-9">
                <label htmlFor="name_field" className="form-label">
                  {" "}
                  Tên{" "}
                </label>
                <input
                  type="text"
                  id="name_field"
                  className="form-control"
                  name="name"
                  value={name}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description_field" className="form-label">
                Mô tả
              </label>
              <textarea
                className="form-control"
                id="description_field"
                rows="8"
                name="description"
                value={description}
                onChange={onChange}
              ></textarea>
            </div>

            <div className="row">
              <div className="m b-3 col-12 col-md-6">
                <label htmlFor="origin_field" className="form-label">
                  {" "}
                  Nguồn gốc{" "}
                </label>
                <input
                  type="text"
                  id="origin_field"
                  className="form-control"
                  name="origin"
                  value={origin}
                  onChange={onChange}
                />
              </div>

              <div className="mb-3 col-12 col-md-6">
                <label htmlFor="price_field" className="form-label">
                  {" "}
                  Giá (VNĐ){" "}
                </label>
                <input
                  type="text"
                  id="price_field"
                  className="form-control"
                  name="price"
                  value={price}
                  onChange={onChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="mb-3 col-12 col-md-4">
                <label htmlFor="category_field" className="form-label">
                  {" "}
                  Danh mục{" "}
                </label>
                <select
                  className="form-select"
                  id="category_field"
                  name="category.name"
                  value={category.name}
                  onChange={onChange}
                >
                  <option value="">Chọn danh mục</option>
                  {PRODUCT_CATEGORIES?.map((categoryName) => (
                    <option key={categoryName} value={categoryName}>
                      {categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* SubCategory Selection */}
              <div className="mb-3 col-12 col-md-4">
                <label htmlFor="subCategory_field" className="form-label">
                  Danh mục phụ L2
                </label>
                <select
                  className="form-select"
                  id="subCategory_field"
                  name="category.subCategory"
                  value={category.subCategory}
                  onChange={onChange}
                  disabled={!category.name}
                >
                  <option value="">Vui lòng chọn</option>
                  {category.name &&
                    PRODUCT_SUBCATEGORIES[category.name].map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                </select>
              </div>

              {/*  SubSubCategory Selection */}
              <div className="mb-3 col-12 col-md-4">
                <label htmlFor="subSubCategory_field" className="form-label">
                  Danh mục phụ L3
                </label>
                <select
                  className="form-select"
                  id="subSubCategory_field"
                  name="category.subSubCategory"
                  value={category.subSubCategory}
                  onChange={onChange}
                  disabled={!category.subCategory}
                >
                  <option value="">Vui lòng chọn</option>
                  {category.subCategory &&
                    PRODUCT_SUBSUBCATEGORIES[category.subCategory].map(
                      (subSubCategory) => (
                        <option key={subSubCategory} value={subSubCategory}>
                          {subSubCategory}
                        </option>
                      )
                    )}
                </select>
              </div>
            </div>

            {/* Variants form fields */}
            <fieldset className="variant-fieldset">
              <legend className="variant-legend">Loại lưu kho</legend>
              {product.variants.map((variant, index) => (
                <div key={index} className="row align-items-end">
                  <div className="mt-1 mb-2 col-8 col-md-3">
                    <label
                      htmlFor={`color_field_${index}`}
                      className="form-label"
                    >
                      Màu sắc
                    </label>
                    <select
                      // type="text"
                      id={`color_field_${index}`}
                      className="form-control"
                      name={`variants.color.${index}`}
                      value={variant.color}
                      onChange={(e) => onChange(e, index)}
                      title="Các màu sắc được chấp nhận: Trắng, Đen, Đỏ, Xanh, Vàng, Hồng, Cam, Xám, Nâu, Sọc, Họa tiết"
                    >
                      <option value="">Trống</option>
                      {PRODUCT_COLORS.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-1 mb-2 col-4 col-md-3">
                    <label htmlFor={`size_field_${index}`} className="form-label">
                      Size
                    </label>
                    <select
                      // type="text"
                      id={`size_field_${index}`}
                      className="form-control"
                      name={`variants.size.${index}`}
                      value={variant.size}
                      onChange={(e) => onChange(e, index)}
                      title="Các kích cỡ được chấp nhận: S, M, L, F"
                    >
                      <option value="">Trống</option>
                      {PRODUCT_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-1 mb-2 col">
                    <label
                      htmlFor={`stock_field_${index}`}
                      className="form-label"
                    >
                      Tồn kho
                    </label>
                    <input
                      type="number"
                      id={`stock_field_${index}`}
                      className="form-control"
                      name={`variants.stock.${index}`}
                      value={variant.stock}
                      onChange={(e) => onChange(e, index)}
                    />
                  </div>
                  <div className="mt-1 mb-2 col-auto">
                    <button
                      type="button"
                      className="btn-form"
                      onClick={() => removeVariant(index)}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn-form mt-1 mb-3"
                onClick={addVariant}
              >
                Thêm loại lưu kho
              </button>
            </fieldset>
            

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="visible_field"
                name="visible"
                checked={visible}
                onChange={onChange}
              />
              <label className="form-check-label" htmlFor="visible_field">
                Hiện
              </label>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2"
              disabled={isLoading}
            >
              {isLoading ? "Đang tạo..." : "TẠO"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewProduct;
