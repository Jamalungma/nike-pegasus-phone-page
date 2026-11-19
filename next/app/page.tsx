import Gallery from "@/components/Gallery";
import SizePicker from "@/components/SizePicker";
import { loadSizes } from "@/lib/sizes";

export default async function Page() {
  const data = await loadSizes();
  // Name, colorway and price are identical on every row: take the first.
  const first = data.ok ? data.rows[0] : null;
  const name = first?.product_name ?? "Nike Pegasus 43";

  return (
    <main className="page">
      <Gallery />

      <section className="info" aria-labelledby="product-name">
        <h1 id="product-name">{name}</h1>
        <p className="colorway">{first?.colorway}</p>
        <div className="price-row">
          <span className="price">{first ? `$${first.price.toFixed(2)}` : ""}</span>
        </div>
        {/* Static placeholder: the data has no rating */}
        <a className="rating" href="#reviews" aria-label="Rated 4.7 out of 5, 128 reviews. Go to reviews">
          <span aria-hidden="true">★ 4.7</span>
          <span className="rating__count" aria-hidden="true">(128)</span>
        </a>
      </section>

      <section className="sizes" aria-labelledby="sizes-title">
        <div className="sizes__head">
          <h2 id="sizes-title">Size (US men&apos;s)</h2>
          <a className="sizes__guide" href="#size-guide">Size guide</a>
        </div>
        <SizePicker rows={data.ok ? data.rows : []} error={data.ok ? undefined : data.error} />
      </section>

      <section className="tech" aria-label="Product details">
        <details><summary>Details</summary><p>Placeholder: details copy.</p></details>
        <details><summary>Materials</summary><p>Placeholder: materials copy.</p></details>
        <details><summary>Care</summary><p>Placeholder: care copy.</p></details>
        <details><summary>Delivery &amp; Returns</summary><p>Placeholder: delivery copy.</p></details>
      </section>

      <section className="reviews" id="reviews" aria-labelledby="reviews-title">
        <h2 id="reviews-title">Reviews</h2>
        <div className="reviews__summary">Placeholder: rating summary</div>
        <div className="reviews__list">Placeholder: review list</div>
      </section>
    </main>
  );
}
