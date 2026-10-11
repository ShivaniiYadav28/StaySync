import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
function PropertyDetails() {
const { id } = useParams();

const {
isAuthenticated,
user,
} = useAuth();

const [property, setProperty] =
useState(null);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState("");

const [selectedImage, setSelectedImage] =
useState(0);

const [isFavorite, setIsFavorite] =
useState(false);

const [favoriteLoading, setFavoriteLoading] =
useState(false);

const [showInquiryForm, setShowInquiryForm] =
useState(false);

const [message, setMessage] =
useState("");

const [moveInDate, setMoveInDate] =
useState("");

const [inquiryLoading, setInquiryLoading] =
useState(false);

const [inquirySuccess, setInquirySuccess] =
useState("");

const [inquiryError, setInquiryError] =
useState("");

const [reviews, setReviews] =
useState([]);

const [averageRating, setAverageRating] =
useState(0);

const [reviewCount, setReviewCount] =
useState(0);

const [reviewsLoading, setReviewsLoading] =
useState(true);

const [reviewError, setReviewError] =
useState("");

const [reviewRating, setReviewRating] =
useState(0);

const [reviewComment, setReviewComment] =
useState("");

const [reviewSubmitting, setReviewSubmitting] =
useState(false);

const [reviewDeleting, setReviewDeleting] =
useState(null);

useEffect(() => {
let isMounted = true;

const loadProperty = async () => {
try {
const response =
await api.get(
`/properties/${id}`
);

if (isMounted) {
setProperty(
response.data.property
);

setSelectedImage(0);
}
} catch (error) {
console.error(
"Load property error:",
error
);

if (isMounted) {
setError(
error.response?.data?.message ||
"Property could not be found."
);
}
} finally {
if (isMounted) {
setLoading(false);
}
}
};

loadProperty();

return () => {
isMounted = false;
};
}, [id]);

useEffect(() => {
let isMounted = true;

const loadReviews = async () => {
try {
setReviewsLoading(true);
setReviewError("");

const response =
await api.get(
`/reviews/property/${id}`
);

if (!isMounted) {
return;
}

setReviews(
response.data.reviews || []
);

setAverageRating(
Number(
response.data.averageRating || 0
)
);

setReviewCount(
Number(
response.data.reviewCount || 0
)
);
} catch (error) {
console.error(
"Load reviews error:",
error
);

if (isMounted) {
setReviewError(
error.response?.data?.message ||
"Unable to load reviews."
);
}
} finally {
if (isMounted) {
setReviewsLoading(false);
}
}
};

loadReviews();

return () => {
isMounted = false;
};
}, [id]);

useEffect(() => {
let isMounted = true;

const checkFavoriteStatus =
async () => {
if (
!isAuthenticated ||
user?.role !== "seeker"
) {
if (isMounted) {
setIsFavorite(false);
}

return;
}

try {
const response =
await api.get(
`/favorites/check/${id}`
);

if (isMounted) {
setIsFavorite(
Boolean(
response.data.isFavorite
)
);
}
} catch (error) {
console.error(
"Favorite check error:",
error
);

if (isMounted) {
setIsFavorite(false);
}
}
};

checkFavoriteStatus();

return () => {
isMounted = false;
};
}, [
id,
isAuthenticated,
user,
]);

const handleFavoriteToggle =
async () => {
if (!isAuthenticated) {
alert(
"Please login as a seeker to save properties."
);

return;
}

if (user?.role !== "seeker") {
alert(
"Only seekers can save properties."
);

return;
}

try {
setFavoriteLoading(true);

if (isFavorite) {
await api.delete(
`/favorites/${id}`
);

setIsFavorite(false);
} else {
await api.post(
`/favorites/${id}`
);

setIsFavorite(true);
}
} catch (error) {
console.error(
"Favorite toggle error:",
error
);

const status =
error.response?.status;

if (status === 409) {
setIsFavorite(true);

alert(
"This property is already in your favorites."
);
} else if (status === 401) {
alert(
"Please login again to continue."
);
} else if (status === 403) {
alert(
"Only seekers can save properties."
);
} else {
alert(
error.response?.data?.message ||
"Unable to update favorites."
);
}
} finally {
setFavoriteLoading(false);
}
};

const handleOpenInquiry =
() => {
if (!isAuthenticated) {
alert(
"Please login as a seeker to contact the owner."
);

return;
}

if (user?.role !== "seeker") {
alert(
"Only seekers can contact property owners."
);

return;
}

setInquiryError("");
setInquirySuccess("");
setShowInquiryForm(true);
};

const handleCloseInquiry =
() => {
if (inquiryLoading) {
return;
}

setShowInquiryForm(false);
setInquiryError("");
};

const handleSendInquiry =
async (event) => {
event.preventDefault();

setInquiryError("");
setInquirySuccess("");

if (
message.trim().length < 10
) {
setInquiryError(
"Message must contain at least 10 characters."
);

return;
}

if (
message.trim().length > 1000
) {
setInquiryError(
"Message cannot exceed 1000 characters."
);

return;
}

try {
setInquiryLoading(true);

const response =
await api.post(
`/inquiries/property/${id}`,
{
message:
message.trim(),

moveInDate:
moveInDate || null,
}
);

setInquirySuccess(
response.data.message ||
"Inquiry sent successfully."
);

setMessage("");
setMoveInDate("");
} catch (error) {
console.error(
"Send inquiry error:",
error
);

setInquiryError(
error.response?.data?.message ||
"Unable to send inquiry."
);
} finally {
setInquiryLoading(false);
}
};

const handleSubmitReview =
async (event) => {
event.preventDefault();

setReviewError("");

if (!isAuthenticated) {
setReviewError(
"Please login as a seeker to write a review."
);

return;
}

if (user?.role !== "seeker") {
setReviewError(
"Only seekers can write reviews."
);

return;
}

if (
!Number.isInteger(
Number(reviewRating)
) ||
Number(reviewRating) < 1 ||
Number(reviewRating) > 5
) {
setReviewError(
"Please select a rating between 1 and 5."
);

return;
}

if (
reviewComment.trim().length < 5
) {
setReviewError(
"Review comment must contain at least 5 characters."
);

return;
}

if (
reviewComment.trim().length > 1000
) {
setReviewError(
"Review comment cannot exceed 1000 characters."
);

return;
}

try {
setReviewSubmitting(true);

const response =
await api.post(
`/reviews/${id}`,
{
rating:
Number(reviewRating),

comment:
reviewComment.trim(),
}
);

const newReview =
response.data.review;

setReviews(
(previous) => [
newReview,
...previous,
]
);

setReviewCount(
(previous) =>
previous + 1
);

const newCount =
reviewCount + 1;

const newAverage =
(
(
averageRating *
reviewCount
) +
Number(reviewRating)
) /
newCount;

setAverageRating(
Number(
newAverage.toFixed(1)
)
);

setReviewRating(0);
setReviewComment("");
} catch (error) {
console.error(
"Submit review error:",
error
);

setReviewError(
error.response?.data?.message ||
"Unable to submit review."
);
} finally {
setReviewSubmitting(false);
}
};

const handleDeleteReview =
async (reviewId) => {
const confirmed =
window.confirm(
"Are you sure you want to delete this review?"
);

if (!confirmed) {
return;
}

try {
setReviewDeleting(
reviewId
);

await api.delete(
`/reviews/${reviewId}`
);

const deletedReview =
reviews.find(
(review) =>
review._id === reviewId
);

const remainingReviews =
reviews.filter(
(review) =>
review._id !== reviewId
);

setReviews(
remainingReviews
);

const oldCount =
reviewCount;

const newCount =
Math.max(
oldCount - 1,
0
);

const oldTotal =
averageRating *
oldCount;

const deletedRating =
Number(
deletedReview?.rating || 0
);

const newTotal =
oldTotal -
deletedRating;

const newAverage =
newCount > 0
? newTotal / newCount
: 0;

setReviewCount(
newCount
);

setAverageRating(
Number(
newAverage.toFixed(1)
)
);
} catch (error) {
console.error(
"Delete review error:",
error
);

alert(
error.response?.data?.message ||
"Unable to delete review."
);
} finally {
setReviewDeleting(null);
}
};

const formatReviewDate =
(date) => {
if (!date) {
return "";
}

return new Date(
date
).toLocaleDateString(
"en-IN",
{
day: "2-digit",
month: "short",
year: "numeric",
}
);
};

const renderStars =
(rating) => {
const numericRating =
Number(rating) || 0;

return (
<div
className="review-stars [display:inline-flex] [align-items:center] [gap:2px]"
aria-label={`${numericRating} out of 5 stars`}
>
{[1, 2, 3, 4, 5].map(
(star) => (
<span
key={star}
className={
star <= numericRating
? "review-star active"
: "review-star"
}
>
★
</span>
)
)}
</div>
);
};

if (loading) {
return (
<div className="details-state [min-height:70vh] [display:flex] [align-items:center] [justify-content:center] [color:#94a3b8] [font-size:16px] [&.error]:[color:#f87171]">
Loading property...
</div>
);
}

if (error || !property) {
return (
<div className="details-state error [min-height:70vh] [display:flex] [align-items:center] [justify-content:center] [color:#94a3b8] [font-size:16px] [&.error]:[color:#f87171]">
{error ||
"Property not found."}
</div>
);
}

const images =
property.images || [];

const hasImages =
images.length > 0;

const currentImage =
images[selectedImage];

const showPreviousImage =
() => {
setSelectedImage(
(previous) =>
previous === 0
? images.length - 1
: previous - 1
);
};

const showNextImage =
() => {
setSelectedImage(
(previous) =>
previous ===
images.length - 1
? 0
: previous + 1
);
};

return (
<div className="property-details-page [min-height:100vh] [background:radial-gradient(_circle_at_top_left,_rgba(20,_184,_166,_0.06),_transparent_30%_),_#0b1120] [padding:42px_20px_80px] [color:#f8fafc] max-[768px]:[padding:30px_14px_60px] max-[480px]:[padding:22px_10px_50px]">
<div className="details-container [width:100%] [max-width:1100px] [margin:0_auto]">

<Link
to="/properties"
className="back-link [display:inline-flex] [align-items:center] [gap:8px] [margin-bottom:22px] [color:#5eead4] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:color_0.2s_ease,_transform_0.2s_ease] hover:[color:#2dd4bf] hover:[transform:translateX(-3px)]"
>
← Back to properties
</Link>

<div className="details-card [overflow:hidden] [background:linear-gradient(_145deg,_rgba(17,_24,_39,_0.98),_rgba(15,_23,_42,_0.98)_)] [border:1px_solid_#273449] [border-radius:20px] [box-shadow:0_24px_70px_rgba(0,_0,_0,_0.35),_0_0_0_1px_rgba(20,_184,_166,_0.02)] max-[480px]:[border-radius:14px]">

<div className="details-gallery [width:100%] [background:#0f172a]">

<div className="details-main-image [position:relative] [width:100%] [height:480px] [overflow:hidden] [background:linear-gradient(_135deg,_#134e4a,_#0f172a_)] [&>_img]:[width:100%] [&>_img]:[height:100%] [&>_img]:[display:block] [&>_img]:[object-fit:cover] [&>_img]:[transition:transform_0.5s_ease] [&:hover_>_img]:[transform:scale(1.015)] after:[content:''] after:[position:absolute] after:[inset:auto_0_0_0] after:[height:120px] after:[pointer-events:none] after:[background:linear-gradient(_to_top,_rgba(2,_6,_23,_0.65),_transparent_)] max-[900px]:[height:400px] max-[768px]:[height:340px] max-[480px]:[height:250px]">

{hasImages ? (
<>
<img
src={currentImage.url}
alt={`${property.title} ${
selectedImage + 1
}`}
/>

<span className="property-type-badge [position:absolute] [top:14px] [right:14px] [padding:7px_12px] [background:rgba(11,_17,_32,_0.88)] [border:1px_solid_#334155] [border-radius:999px] [color:#2dd4bf] [font-size:12px] [font-weight:700] [backdrop-filter:blur(8px)] max-[400px]:[top:12px] max-[400px]:[right:12px] max-[400px]:[padding:6px_9px] [z-index:2] [top:20px] [right:20px] [padding:9px_16px] [border:1px_solid_rgba(94,_234,_212,_0.28)] [background:rgba(15,_23,_42,_0.88)] [backdrop-filter:blur(10px)] [color:#5eead4] [font-size:13px] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.3)] max-[768px]:[top:14px] max-[768px]:[right:14px] max-[480px]:[top:10px] max-[480px]:[right:10px] max-[480px]:[padding:7px_11px] max-[480px]:[font-size:12px]">
{property.propertyType}
</span>

{images.length > 1 && (
<>
<button
type="button"
className="gallery-arrow gallery-arrow-left [position:absolute] [z-index:3] [top:50%] [transform:translateY(-50%)] [width:48px] [height:48px] [display:flex] [align-items:center] [justify-content:center] [border:1px_solid_rgba(148,_163,_184,_0.35)] [border-radius:50%] [background:rgba(15,_23,_42,_0.78)] [backdrop-filter:blur(8px)] [color:#f8fafc] [font-size:32px] [line-height:1] [cursor:pointer] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.3)] [transition:background_0.2s_ease,_border-color_0.2s_ease,_color_0.2s_ease,_transform_0.2s_ease] hover:[background:#0f766e] hover:[border-color:#2dd4bf] hover:[color:white] max-[768px]:[width:42px] max-[768px]:[height:42px] max-[768px]:[font-size:28px] max-[480px]:[width:36px] max-[480px]:[height:36px] max-[480px]:[font-size:24px] [left:20px] max-[768px]:[left:12px] max-[480px]:[left:8px]"
onClick={
showPreviousImage
}
aria-label="Previous image"
>
‹
</button>

<button
type="button"
className="gallery-arrow gallery-arrow-right [position:absolute] [z-index:3] [top:50%] [transform:translateY(-50%)] [width:48px] [height:48px] [display:flex] [align-items:center] [justify-content:center] [border:1px_solid_rgba(148,_163,_184,_0.35)] [border-radius:50%] [background:rgba(15,_23,_42,_0.78)] [backdrop-filter:blur(8px)] [color:#f8fafc] [font-size:32px] [line-height:1] [cursor:pointer] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.3)] [transition:background_0.2s_ease,_border-color_0.2s_ease,_color_0.2s_ease,_transform_0.2s_ease] hover:[background:#0f766e] hover:[border-color:#2dd4bf] hover:[color:white] max-[768px]:[width:42px] max-[768px]:[height:42px] max-[768px]:[font-size:28px] max-[480px]:[width:36px] max-[480px]:[height:36px] max-[480px]:[font-size:24px] [right:20px] max-[768px]:[right:12px] max-[480px]:[right:8px]"
onClick={
showNextImage
}
aria-label="Next image"
>
›
</button>

<div className="image-counter [position:absolute] [z-index:3] [bottom:18px] [right:20px] [padding:7px_12px] [border:1px_solid_rgba(148,_163,_184,_0.2)] [border-radius:999px] [background:rgba(2,_6,_23,_0.72)] [backdrop-filter:blur(8px)] [color:#f8fafc] [font-size:12px] [font-weight:700] max-[480px]:[right:10px] max-[480px]:[bottom:10px]">
{selectedImage + 1} /{" "}
{images.length}
</div>
</>
)}
</>
) : (
<>
<div className="no-image-placeholder [width:100%] [height:100%] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [gap:12px] [background:radial-gradient(_circle,_rgba(20,_184,_166,_0.08),_transparent_55%_)] [color:#64748b] [font-size:15px] [font-weight:600]">
<span className="no-image-icon [font-size:58px] [opacity:0.8]">
🏠
</span>

<span>
No property image
</span>
</div>

<span className="property-type-badge [position:absolute] [top:14px] [right:14px] [padding:7px_12px] [background:rgba(11,_17,_32,_0.88)] [border:1px_solid_#334155] [border-radius:999px] [color:#2dd4bf] [font-size:12px] [font-weight:700] [backdrop-filter:blur(8px)] max-[400px]:[top:12px] max-[400px]:[right:12px] max-[400px]:[padding:6px_9px] [z-index:2] [top:20px] [right:20px] [padding:9px_16px] [border:1px_solid_rgba(94,_234,_212,_0.28)] [background:rgba(15,_23,_42,_0.88)] [backdrop-filter:blur(10px)] [color:#5eead4] [font-size:13px] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.3)] max-[768px]:[top:14px] max-[768px]:[right:14px] max-[480px]:[top:10px] max-[480px]:[right:10px] max-[480px]:[padding:7px_11px] max-[480px]:[font-size:12px]">
{property.propertyType}
</span>
</>
)}

</div>

{images.length > 1 && (
<div className="image-thumbnails [display:flex] [gap:10px] [padding:14px_16px] [overflow-x:auto] [background:#0f172a] [border-top:1px_solid_#273449] [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">

{images.map(
(image, index) => (
<button
type="button"
key={
image._id ||
image.publicId ||
index
}
className={`image-thumbnail [flex:0_0_88px] [width:88px] [height:68px] [padding:0] [overflow:hidden] [border:2px_solid_transparent] [border-radius:10px] [background:#1e293b] [cursor:pointer] [opacity:0.55] [transition:opacity_0.2s_ease,_border-color_0.2s_ease,_transform_0.2s_ease] hover:[opacity:0.9] hover:[transform:translateY(-2px)] [&.active]:[opacity:1] [&.active]:[border-color:#14b8a6] [&.active]:[box-shadow:0_0_0_2px_rgba(20,_184,_166,_0.12)] [&_img]:[width:100%] [&_img]:[height:100%] [&_img]:[display:block] [&_img]:[object-fit:cover] max-[480px]:[flex-basis:70px] max-[480px]:[width:70px] max-[480px]:[height:55px] ${
selectedImage === index
? "active"
: ""
}`}
onClick={() =>
setSelectedImage(
index
)
}
>

<img
src={image.url}
alt={`Thumbnail ${
index + 1
}`}
/>

</button>
)
)}

</div>
)}

</div>

<div className="details-content [padding:38px] [&_section]:[margin-top:34px] [&_h2]:[margin:0_0_14px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:21px] [&_h2]:[font-weight:750] [&_h2]:[letter-spacing:-0.2px] max-[768px]:[padding:28px] max-[650px]:[padding:22px] max-[480px]:[padding:18px]">

<div className="details-title [display:flex] [align-items:flex-start] [justify-content:space-between] [gap:30px] [&_h1]:[margin:0_0_10px] [&_h1]:[color:#f8fafc] [&_h1]:[font-size:34px] [&_h1]:[line-height:1.2] [&_h1]:[font-weight:800] [&_h1]:[letter-spacing:-0.5px] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] [&_p]:[line-height:1.6] max-[768px]:[&_h1]:[font-size:28px] max-[768px]:[gap:18px] max-[650px]:[flex-direction:column] max-[480px]:[&_h1]:[font-size:24px] max-[480px]:[&_p]:[font-size:13px]">

<div>

<h1>
{property.title}
</h1>

<p>
📍 {property.address},{" "}
{property.area},{" "}
{property.city} -{" "}
{property.pincode}
</p>

</div>

<div className="details-price [flex-shrink:0] [color:#5eead4] [font-size:30px] [line-height:1] [font-weight:800] [white-space:nowrap] [&_small]:[color:#94a3b8] [&_small]:[font-size:13px] [&_small]:[font-weight:400] max-[768px]:[font-size:26px] max-[650px]:[font-size:24px]">
₹{property.rent}

<small>
/month
</small>

</div>

</div>

<div className="property-rating-summary [display:flex] [align-items:center] [flex-wrap:wrap] [gap:14px] [margin:22px_0_26px] [padding:15px_18px] [border:1px_solid_#273449] [border-radius:12px] [background:linear-gradient(_135deg,_#111827,_#0f172a_)] max-[650px]:[gap:10px]">

<div className="rating-summary-stars [display:flex] [align-items:center]">

{renderStars(
Math.round(
averageRating
)
)}

</div>

<div className="rating-summary-value [display:flex] [align-items:baseline] [gap:3px] [&_strong]:[color:#f8fafc] [&_strong]:[font-size:24px] [&_span]:[color:#94a3b8] [&_span]:[font-size:13px]">

<strong>
{averageRating.toFixed(1)}
</strong>

<span>
/ 5
</span>

</div>

<div className="rating-summary-count [color:#94a3b8] [font-size:13px]">

{reviewCount === 1
? "1 review"
: `${reviewCount} reviews`}

</div>

</div>

{user?.role === "seeker" && (
<div className="details-favorite-wrapper [display:flex] [align-items:center] [margin:20px_0_26px] max-[480px]:[width:100%]">

<button
type="button"
className={`details-favorite-button [display:inline-flex] [align-items:center] [justify-content:center] [gap:10px] [min-width:215px] [padding:12px_20px] [border:1px_solid_#334155] [border-radius:10px] [background:#1e293b] [color:#cbd5e1] [font-size:14px] [font-weight:600] [cursor:pointer] [transition:background_0.2s_ease,_border-color_0.2s_ease,_color_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] [&_span]:[font-size:23px] [&_span]:[line-height:1] hover:[background:#273449] hover:[border-color:#14b8a6] hover:[color:#5eead4] hover:[transform:translateY(-2px)] hover:[box-shadow:0_8px_20px_rgba(0,_0,_0,_0.25)] disabled:[opacity:0.6] disabled:[cursor:not-allowed] disabled:[transform:none] max-[480px]:[width:100%] ${
isFavorite
? "details-favorite-active"
: ""
}`}
onClick={
handleFavoriteToggle
}
disabled={
favoriteLoading
}
>

<span>
{isFavorite
? "♥"
: "♡"}
</span>

{favoriteLoading
? "Saving..."
: isFavorite
? "Saved to Favorites"
: "Save Property"}

</button>

</div>
)}

<div className="details-grid [display:grid] [grid-template-columns:repeat(5,_1fr)] [gap:12px] [margin:30px_0] [padding:18px_0] [border-top:1px_solid_#273449] [border-bottom:1px_solid_#273449] [&_div]:[min-height:72px] [&_div]:[display:flex] [&_div]:[flex-direction:column] [&_div]:[justify-content:center] [&_div]:[gap:7px] [&_div]:[padding:14px] [&_div]:[border:1px_solid_rgba(51,_65,_85,_0.7)] [&_div]:[border-radius:10px] [&_div]:[background:rgba(15,_23,_42,_0.7)] [&_div]:[transition:border-color_0.2s_ease,_transform_0.2s_ease] [&_div:hover]:[border-color:rgba(20,_184,_166,_0.45)] [&_div:hover]:[transform:translateY(-2px)] [&_span]:[color:#64748b] [&_span]:[font-size:11px] [&_span]:[font-weight:600] [&_span]:[text-transform:uppercase] [&_span]:[letter-spacing:0.5px] [&_strong]:[color:#e2e8f0] [&_strong]:[font-size:14px] max-[900px]:[grid-template-columns:repeat(3,_1fr)] max-[650px]:[grid-template-columns:repeat(2,_1fr)] max-[480px]:[grid-template-columns:1fr_1fr] max-[480px]:[gap:8px] max-[480px]:[&_div]:[padding:11px] max-[480px]:[&_div]:[min-height:64px] max-[480px]:[&_strong]:[font-size:13px]">

<div>
<span>
Property
</span>

<strong>
{property.propertyType}
</strong>
</div>

<div>
<span>
Suitable for
</span>

<strong>
{property.gender}
</strong>
</div>

<div>
<span>
Room
</span>

<strong>
{property.roomType}
</strong>
</div>

<div>
<span>
Deposit
</span>

<strong>
₹{property.deposit}
</strong>
</div>

<div>
<span>
Available
</span>

<strong>
{property.availableRooms}{" "}
rooms
</strong>
</div>

</div>

<section>

<h2>
About this place
</h2>

<p className="details-description [margin:0] [color:#94a3b8] [line-height:1.8] [font-size:15px]">
{property.description}
</p>

</section>

<section>

<h2>
Amenities
</h2>

<div className="amenities [display:grid] [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:10px] [&_span]:[display:flex] [&_span]:[align-items:center] [&_span]:[min-height:42px] [&_span]:[padding:10px_13px] [&_span]:[border:1px_solid_rgba(45,_212,_191,_0.14)] [&_span]:[border-radius:9px] [&_span]:[background:rgba(20,_184,_166,_0.07)] [&_span]:[color:#cbd5e1] [&_span]:[font-size:13px] [&_span]:[font-weight:500] [&_span]:[transition:background_0.2s_ease,_border-color_0.2s_ease,_transform_0.2s_ease] [&_span:hover]:[background:rgba(20,_184,_166,_0.12)] [&_span:hover]:[border-color:rgba(45,_212,_191,_0.28)] [&_span:hover]:[transform:translateY(-2px)] max-[900px]:[grid-template-columns:repeat(2,_1fr)] max-[650px]:[grid-template-columns:1fr]">

{property.amenities?.length >
0 ? (

property.amenities.map(
(
amenity,
index
) => (

<span
key={index}
>
✓ {amenity}
</span>

)
)

) : (

<span>
No amenities listed.
</span>

)}

</div>

</section>

<section>

<h2>
House rules
</h2>

{property.rules?.length >
0 ? (

<ul className="rules [margin:0] [padding:16px_18px_16px_36px] [border:1px_solid_#273449] [border-radius:12px] [background:#0f172a] [color:#94a3b8] [line-height:1.9] [&_li]:[padding:3px_0] [&_li::marker]:[color:#14b8a6]">

{property.rules.map(
(
rule,
index
) => (

<li
key={index}
>
{rule}
</li>

)
)}

</ul>

) : (

<p>
No specific house
rules listed.
</p>

)}

</section>

<section
style={{
marginTop: "32px",
padding: "24px",
borderRadius: "18px",
background: "rgba(17, 24, 39, 0.72)",
border: "1px solid rgba(148, 163, 184, 0.16)",
}}
>

<div
style={{
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: "16px",
marginBottom: "18px",
flexWrap: "wrap",
}}
>

<div>

<h2 style={{ marginBottom: "6px" }}>
Property Location
</h2>

<p style={{ margin: 0 }}>
{property.address}, {property.area}, {property.city} - {property.pincode}
</p>

</div>

<a
href={(() => {

const location =
property.location || {};

const latitude =
Number(
location.latitude ??
location.lat ??
property.latitude
);

const longitude =
Number(
location.longitude ??
location.lng ??
property.longitude
);

if (
Number.isFinite(latitude) &&
Number.isFinite(longitude)
) {

return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

}

const addressQuery = [
property.address,
property.area,
property.city,
property.pincode,
]
.filter(Boolean)
.join(", ");

return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;

})()}
target="_blank"
rel="noopener noreferrer"
style={{
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "10px 16px",
borderRadius: "10px",
background: "#06b6d4",
color: "#ffffff",
textDecoration: "none",
fontWeight: 700,
whiteSpace: "nowrap",
}}
>
Open in Google Maps
</a>

</div>

{(() => {

const location =
property.location || {};

const latitude =
Number(
location.latitude ??
location.lat ??
property.latitude
);

const longitude =
Number(
location.longitude ??
location.lng ??
property.longitude
);

const hasCoordinates =
Number.isFinite(latitude) &&
Number.isFinite(longitude);

const addressQuery = [
property.address,
property.area,
property.city,
property.pincode,
]
.filter(Boolean)
.join(", ");

const mapQuery =
hasCoordinates
? `${latitude},${longitude}`
: addressQuery;

return (
<div
style={{
width: "100%",
height: "360px",
overflow: "hidden",
borderRadius: "14px",
border: "1px solid rgba(148, 163, 184, 0.16)",
background: "#0f172a",
}}
>

<iframe
title="Property location map"
src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`}
width="100%"
height="100%"
style={{ border: 0 }}
loading="lazy"
referrerPolicy="no-referrer-when-downgrade"
/>

</div>
);

})()}

</section>

{property.owner && (

<section className="owner-section [padding:22px] [border:1px_solid_#273449] [border-radius:14px] [background:linear-gradient(_135deg,_#111827,_#0f172a_)] [&_h2]:[margin:0_0_14px] [&_h2]:[color:#f8fafc] [&_p]:[margin:6px_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] [&_strong]:[color:#f8fafc] [&_strong]:[font-size:16px] max-[480px]:[padding:18px]">

<h2>
Listed by
</h2>

<p>

<strong>
{property.owner.name}
</strong>

</p>

<p>
{property.owner.email}
</p>

</section>

)}

{user?.role === "seeker" && (
  <>
    <Link
      to={"/properties/" + id + "/book"}
      className="inquiry-btn [width:100%] [max-width:360px] [display:block] [margin:16px_auto_0] [padding:13px_18px] [border:none] [border-radius:10px] [background:linear-gradient(_135deg,_#0d9488,_#14b8a6_)] [color:#ffffff] [font-size:15px] [font-weight:700] [cursor:pointer] [box-shadow:0_8px_24px_rgba(20,_184,_166,_0.12)] [transition:transform_0.2s_ease,_box-shadow_0.2s_ease,_filter_0.2s_ease] hover:[transform:translateY(-2px)] hover:[filter:brightness(1.06)] hover:[box-shadow:0_12px_30px_rgba(20,_184,_166,_0.2)]"
      style={{ display: "block", textAlign: "center", textDecoration: "none" }}
    >
      Book this PG
    </Link>

    <button
      className="inquiry-btn [width:100%] [max-width:360px] [display:block] [margin:16px_auto_0] [padding:13px_18px] [border:none] [border-radius:10px] [background:linear-gradient(_135deg,_#0d9488,_#14b8a6_)] [color:#ffffff] [font-size:15px] [font-weight:700] [cursor:pointer] [box-shadow:0_8px_24px_rgba(20,_184,_166,_0.12)] [transition:transform_0.2s_ease,_box-shadow_0.2s_ease,_filter_0.2s_ease] hover:[transform:translateY(-2px)] hover:[filter:brightness(1.06)] hover:[box-shadow:0_12px_30px_rgba(20,_184,_166,_0.2)]"
      type="button"
      onClick={handleOpenInquiry}
    >
      Contact Owner
    </button>
  </>
)}
{showInquiryForm && (

<div className="inquiry-form-wrapper [margin-top:28px] [padding:26px] [border:1px_solid_#273449] [border-radius:14px] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [box-shadow:0_12px_35px_rgba(0,_0,_0,_0.25)] max-[650px]:[padding:20px] max-[480px]:[padding:16px]">

<div className="inquiry-form-header [display:flex] [align-items:flex-start] [justify-content:space-between] [gap:20px] [margin-bottom:22px] [&_h2]:[margin:0_0_6px] [&_h2]:[color:#f8fafc] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px]">

<div>

<h2>
Contact Owner
</h2>

<p>
Send an inquiry about
this property.
</p>

</div>

<button
type="button"
className="inquiry-close-button [flex-shrink:0] [width:35px] [height:35px] [border:1px_solid_#334155] [border-radius:50%] [background:#1e293b] [color:#cbd5e1] [font-size:23px] [line-height:1] [cursor:pointer] [transition:background_0.2s_ease,_border-color_0.2s_ease] hover:[background:#334155] hover:[border-color:#475569]"
onClick={
handleCloseInquiry
}
disabled={
inquiryLoading
}
>
×
</button>

</div>

{inquirySuccess && (

<div className="inquiry-success [padding:12px_14px] [margin-bottom:18px] [border-radius:9px] [font-size:14px] [border:1px_solid_rgba(45,_212,_191,_0.2)] [background:rgba(20,_184,_166,_0.1)] [color:#5eead4]">
{inquirySuccess}
</div>

)}

{inquiryError && (

<div className="inquiry-error [padding:12px_14px] [margin-bottom:18px] [border-radius:9px] [font-size:14px] [border:1px_solid_rgba(248,_113,_113,_0.2)] [background:rgba(239,_68,_68,_0.1)] [color:#f87171]">
{inquiryError}
</div>

)}

{!inquirySuccess && (

<form
className="inquiry-form [display:flex] [flex-direction:column] [gap:20px]"
onSubmit={
handleSendInquiry
}
>

<div className="inquiry-field [display:flex] [flex-direction:column] [gap:8px] [&_label]:[color:#e2e8f0] [&_label]:[font-size:13px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[box-sizing:border-box] [&_input]:[padding:13px_14px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[outline:none] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-family:inherit] [&_input]:[font-size:14px] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_textarea]:[width:100%] [&_textarea]:[box-sizing:border-box] [&_textarea]:[padding:13px_14px] [&_textarea]:[border:1px_solid_#334155] [&_textarea]:[border-radius:9px] [&_textarea]:[outline:none] [&_textarea]:[background:#0f172a] [&_textarea]:[color:#f8fafc] [&_textarea]:[font-family:inherit] [&_textarea]:[font-size:14px] [&_textarea]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_textarea::placeholder]:[color:#64748b] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[background:#101b2e] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_textarea:focus]:[border-color:#14b8a6] [&_textarea:focus]:[background:#101b2e] [&_textarea:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_textarea]:[min-height:140px] [&_textarea]:[resize:vertical] [&_small]:[align-self:flex-end] [&_small]:[color:#64748b] [&_small]:[font-size:12px]">

<label htmlFor="moveInDate">
Preferred Move-in Date
</label>

<input
id="moveInDate"
type="date"
value={
moveInDate
}
min={
new Date()
.toISOString()
.split("T")[0]
}
onChange={(event) =>
setMoveInDate(
event.target.value
)
}
/>

</div>

<div className="inquiry-field [display:flex] [flex-direction:column] [gap:8px] [&_label]:[color:#e2e8f0] [&_label]:[font-size:13px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[box-sizing:border-box] [&_input]:[padding:13px_14px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[outline:none] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-family:inherit] [&_input]:[font-size:14px] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_textarea]:[width:100%] [&_textarea]:[box-sizing:border-box] [&_textarea]:[padding:13px_14px] [&_textarea]:[border:1px_solid_#334155] [&_textarea]:[border-radius:9px] [&_textarea]:[outline:none] [&_textarea]:[background:#0f172a] [&_textarea]:[color:#f8fafc] [&_textarea]:[font-family:inherit] [&_textarea]:[font-size:14px] [&_textarea]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_textarea::placeholder]:[color:#64748b] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[background:#101b2e] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_textarea:focus]:[border-color:#14b8a6] [&_textarea:focus]:[background:#101b2e] [&_textarea:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_textarea]:[min-height:140px] [&_textarea]:[resize:vertical] [&_small]:[align-self:flex-end] [&_small]:[color:#64748b] [&_small]:[font-size:12px]">

<label htmlFor="message">
Message *
</label>

<textarea
id="message"
value={message}
onChange={(event) =>
setMessage(
event.target.value
)
}
placeholder="Hi, I am interested in this property. I would like to know more about availability and the room."
rows="6"
maxLength="1000"
required
/>

<small>
{message.length}/1000
</small>

</div>

<button
type="submit"
className="inquiry-submit-button [align-self:flex-start] [padding:12px_24px] [border:none] [border-radius:9px] [background:#0d9488] [color:#ffffff] [font-size:14px] [font-weight:700] [cursor:pointer] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_8px_20px_rgba(20,_184,_166,_0.15)] disabled:[opacity:0.65] disabled:[cursor:not-allowed] disabled:[transform:none] max-[650px]:[width:100%] max-[650px]:[align-self:stretch]"
disabled={
inquiryLoading
}
>

{inquiryLoading
? "Sending..."
: "Send Inquiry"}

</button>

</form>

)}

</div>

)}

<section className="reviews-section [margin-top:48px] [padding-top:34px] [border-top:1px_solid_#273449]">

<div className="reviews-section-header [display:flex] [align-items:flex-start] [justify-content:space-between] [gap:24px] [margin-bottom:24px] [&_h2]:[margin:0_0_7px] [&_h2]:[color:#f8fafc] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] max-[768px]:[flex-direction:column]">

<div>

<h2>
Reviews & Ratings
</h2>

<p>
See what previous seekers
say about this property.
</p>

</div>

{reviewCount > 0 && (

<div className="reviews-header-rating [display:flex] [align-items:center] [gap:12px] [padding:11px_15px] [border:1px_solid_#273449] [border-radius:10px] [background:#111827] [&>_strong]:[color:#f8fafc] [&>_strong]:[font-size:26px] [&>_div]:[display:flex] [&>_div]:[flex-direction:column] [&>_div]:[gap:3px] [&_span]:[color:#94a3b8] [&_span]:[font-size:12px] max-[768px]:[width:fit-content]">

<strong>
{averageRating.toFixed(1)}
</strong>

<div>

{renderStars(
Math.round(
averageRating
)
)}

<span>

{reviewCount === 1
? "1 review"
: `${reviewCount} reviews`}

</span>

</div>

</div>

)}

</div>

{reviewError && (

<div className="review-error [margin-bottom:20px] [padding:12px_14px] [border:1px_solid_rgba(248,_113,_113,_0.2)] [border-radius:9px] [background:rgba(239,_68,_68,_0.1)] [color:#f87171] [font-size:14px]">
{reviewError}
</div>

)}

{isAuthenticated &&
user?.role === "seeker" && (

<div className="review-form-wrapper [margin-bottom:30px] [padding:26px] [border:1px_solid_#273449] [border-radius:14px] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [box-shadow:0_10px_30px_rgba(0,_0,_0,_0.2)] [&_h3]:[margin:0_0_6px] [&_h3]:[color:#f8fafc] [&>_p]:[margin:0_0_22px] [&>_p]:[color:#94a3b8] [&>_p]:[font-size:14px] max-[650px]:[padding:20px] max-[480px]:[padding:16px]">

<h3>
Share your experience
</h3>

<p>
Have you stayed here?
Leave a review for other
seekers.
</p>

<form
className="review-form [display:flex] [flex-direction:column] [gap:20px]"
onSubmit={
handleSubmitReview
}
>

<div className="review-rating-field [display:flex] [flex-direction:column] [gap:8px] [&_label]:[color:#e2e8f0] [&_label]:[font-size:13px] [&_label]:[font-weight:600]">

<label>
Your Rating
</label>

<div className="rating-selector [display:flex] [align-items:center] [gap:4px]">

{[1, 2, 3, 4, 5].map(
(star) => (

<button
key={star}
type="button"
className={
star <=
reviewRating
? "rating-star selected"
: "rating-star"
}
onClick={() =>
setReviewRating(
star
)
}
aria-label={`Rate ${star} out of 5`}
>

★

</button>

)
)}

</div>

</div>

<div className="review-comment-field [display:flex] [flex-direction:column] [gap:8px] [&_label]:[color:#e2e8f0] [&_label]:[font-size:13px] [&_label]:[font-weight:600] [&_textarea]:[width:100%] [&_textarea]:[box-sizing:border-box] [&_textarea]:[padding:13px_14px] [&_textarea]:[border:1px_solid_#334155] [&_textarea]:[border-radius:9px] [&_textarea]:[outline:none] [&_textarea]:[background:#0f172a] [&_textarea]:[color:#f8fafc] [&_textarea]:[font-family:inherit] [&_textarea]:[font-size:14px] [&_textarea]:[resize:vertical] [&_textarea]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [&_textarea::placeholder]:[color:#64748b] [&_textarea:focus]:[border-color:#14b8a6] [&_textarea:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_small]:[align-self:flex-end] [&_small]:[color:#64748b] [&_small]:[font-size:12px]">

<label htmlFor="reviewComment">
Your Review
</label>

<textarea
id="reviewComment"
value={
reviewComment
}
onChange={(event) =>
setReviewComment(
event.target.value
)
}
placeholder="Share your experience with this property and owner..."
rows="5"
maxLength="1000"
/>

<small>
{reviewComment.length}/1000
</small>

</div>

<button
type="submit"
className="review-submit-button [align-self:flex-start] [padding:12px_22px] [border:none] [border-radius:9px] [background:#0d9488] [color:#ffffff] [font-size:14px] [font-weight:700] [cursor:pointer] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_8px_20px_rgba(20,_184,_166,_0.15)] disabled:[opacity:0.65] disabled:[cursor:not-allowed] disabled:[transform:none] max-[650px]:[width:100%] max-[650px]:[align-self:stretch]"
disabled={
reviewSubmitting
}
>

{reviewSubmitting
? "Submitting..."
: "Submit Review"}

</button>

</form>

</div>

)}

<div className="reviews-list [display:flex] [flex-direction:column] [gap:14px]">

{reviewsLoading ? (

<div className="reviews-state [padding:30px] [text-align:center] [color:#94a3b8]">
Loading reviews...
</div>

) : reviews.length === 0 ? (

<div className="reviews-empty [padding:40px_20px] [text-align:center] [border:1px_solid_#273449] [border-radius:12px] [background:#111827] [&_h3]:[margin:0_0_6px] [&_h3]:[color:#f8fafc] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px]">

<div className="reviews-empty-icon [width:48px] [height:48px] [margin:0_auto_12px] [display:flex] [align-items:center] [justify-content:center] [border-radius:50%] [background:rgba(245,_158,_11,_0.1)] [color:#f59e0b] [font-size:24px]">
★
</div>

<h3>
No reviews yet
</h3>

<p>
Be the first to share
your experience with
this property.
</p>

</div>

) : (

reviews.map(
(review) => (

<article
className="review-card [padding:20px] [border:1px_solid_#273449] [border-radius:12px] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [transition:border-color_0.2s_ease,_transform_0.2s_ease] hover:[border-color:#334155] hover:[transform:translateY(-1px)]"
key={review._id}
>

<div className="review-card-header [display:flex] [align-items:flex-start] [justify-content:space-between] [gap:16px] [&_h3]:[margin:0_0_7px] [&_h3]:[color:#f8fafc] [&_h3]:[font-size:16px] max-[650px]:[flex-direction:column]">

<div>

<h3>
{review.seeker?.name ||
"Seeker"}
</h3>

<div className="review-card-meta [display:flex] [align-items:center] [gap:10px] [&_span]:[color:#94a3b8] [&_span]:[font-size:12px]">

{renderStars(
review.rating
)}

<span>

{formatReviewDate(
review.createdAt
)}

</span>

</div>

</div>

{user?._id ===
review.seeker?._id && (

<button
type="button"
className="delete-review-button [padding:7px_12px] [border:1px_solid_#7f1d1d] [border-radius:7px] [background:rgba(239,_68,_68,_0.08)] [color:#f87171] [font-size:12px] [font-weight:600] [cursor:pointer] [transition:background_0.2s_ease,_border-color_0.2s_ease] hover:[background:rgba(239,_68,_68,_0.15)] hover:[border-color:#991b1b] disabled:[opacity:0.6] disabled:[cursor:not-allowed] max-[650px]:[align-self:flex-start]"
onClick={() =>
handleDeleteReview(
review._id
)
}
disabled={
reviewDeleting ===
review._id
}
>

{reviewDeleting ===
review._id
? "Deleting..."
: "Delete"}

</button>

)}

</div>

<p className="review-comment [margin:14px_0_0] [color:#cbd5e1] [font-size:14px] [line-height:1.7] [white-space:pre-wrap]">
{review.comment}
</p>

</article>

)
)

)}

</div>

</section>

</div>

</div>

</div>

</div>
);
}

export default PropertyDetails;
