export type LocatorDef =
  | string
  | {
      primary: string;
      fallbacks?: string[];
    };

// One central place for all locator keys.
// Plain string values are still supported for backward compatibility.
// Supported prefixes:
// - css:
// - id:
// - title:
// - text:
// - role:

export const L = {
  // Login page
  login_username: 'username',
  login_password: 'password',
  login_loginButton: {
    primary: 'login-button-old',
    fallbacks: ['login-button'],
  },
  login_error: 'error',

  // Inventory page - Header/Navigation
  inventory_headerContainer: 'header-container',
  inventory_primaryHeader: 'primary-header',
  inventory_secondaryHeader: 'secondary-header',
  inventory_openMenu: 'open-menu',
  inventory_closeMenu: 'close-menu',
  inventory_hamburgerMenu: 'role:button|Open Menu',
  inventory_allItemsLink: 'inventory-sidebar-link',
  inventory_aboutLink: 'about-sidebar-link',
  inventory_logoutLink: 'logout-sidebar-link',
  inventory_resetAppStateLink: 'reset-sidebar-link',
  inventory_shoppingCartLink: 'shopping-cart-link',

  // Inventory page - Title and Sorting
  inventory_pageTitle: 'text:Products',
  inventory_title: 'title',
  inventory_productSortContainer: 'product-sort-container',
  inventory_activeOption: 'active-option',

  // Inventory page - Product Container
  inventory_page: 'inventory-container',
  inventory_container: 'inventory-container',
  inventory_list: 'inventory-list',
  inventory_item: 'inventory-item',

  // Inventory page - Sauce Labs Backpack
  inventory_backpackImgLink: 'item-4-img-link',
  inventory_backpackImg: 'inventory-item-sauce-labs-backpack-img',
  inventory_backpackTitleLink: 'item-4-title-link',
  inventory_backpackPrice: 'css:[data-test="inventory-list"] > [data-test="inventory-item"]:nth-child(1) [data-test="inventory-item-price"]',
  inventory_addToCartButton: 'add-to-cart-sauce-labs-backpack',

  // Inventory page - Sauce Labs Bike Light
  inventory_bikeLightImgLink: 'item-0-img-link',
  inventory_bikeLightImg: 'inventory-item-sauce-labs-bike-light-img',
  inventory_bikeLightTitleLink: 'item-0-title-link',
  inventory_bikeLightPrice: 'css:[data-test="inventory-list"] > [data-test="inventory-item"]:nth-child(2) [data-test="inventory-item-price"]',
  inventory_bikeLightAddToCart: 'add-to-cart-sauce-labs-bike-light',

  // Inventory page - Sauce Labs Bolt T-Shirt
  inventory_boltTShirtImgLink: 'item-1-img-link',
  inventory_boltTShirtImg: 'inventory-item-sauce-labs-bolt-t-shirt-img',
  inventory_boltTShirtTitleLink: 'item-1-title-link',
  inventory_boltTShirtAddToCart: 'add-to-cart-sauce-labs-bolt-t-shirt',

  // Inventory page - Sauce Labs Fleece Jacket
  inventory_fleecJacketImgLink: 'item-5-img-link',
  inventory_fleecJacketImg: 'inventory-item-sauce-labs-fleece-jacket-img',
  inventory_fleecJacketTitleLink: 'item-5-title-link',
  inventory_fleecJacketAddToCart: 'add-to-cart-sauce-labs-fleece-jacket',

  // Inventory page - Sauce Labs Onesie
  inventory_onesieImgLink: 'item-2-img-link',
  inventory_onesieImg: 'inventory-item-sauce-labs-onesie-img',
  inventory_onesieTitleLink: 'item-2-title-link',
  inventory_onesieAddToCart: 'add-to-cart-sauce-labs-onesie',

  // Inventory page - Test.allTheThings() T-Shirt (Red)
  inventory_redTShirtImgLink: 'item-3-img-link',
  inventory_redTShirtImg: 'inventory-item-test.allthethings()-t-shirt-(red)-img',
  inventory_redTShirtTitleLink: 'item-3-title-link',
  inventory_redTShirtAddToCart: 'add-to-cart-test.allthethings()-t-shirt-(red)',

  // Inventory page - Footer
  inventory_footer: 'footer',
  inventory_socialTwitter: 'social-twitter',
  inventory_socialFacebook: 'social-facebook',
  inventory_socialLinkedin: 'social-linkedin',
  inventory_footerCopy: 'footer-copy',
} as const satisfies Record<string, LocatorDef>;

export type LocatorKey = keyof typeof L;
