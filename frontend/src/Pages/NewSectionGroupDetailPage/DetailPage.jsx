import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    fetchGroupsForQuickPick, 
    fetchProductsForGroup,
    fetchGroupsForBandB,
    fetchProductsForBandBGroup,
    getGroupsBySavingZoneId,
    getProductsForSavingZoneGroup
} from '../../utils/supabaseApi'; // Adjust path
import ProductCard2 from '../../components/ProductCard2/ProductCard2.jsx'; // Adjust path

function DetailPage() {
    const { section, id } = useParams(); 
    
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [pageTitle, setPageTitle] = useState('');

    // 1. Fetch groups based on the 'section' from the URL
    useEffect(() => {
        async function loadGroups() {
            try {
                setLoadingGroups(true);
                setGroups([]);
                setSelectedGroup(null);
                setProducts([]);
                let fetchedGroups;

                switch (section) {
                    case 'b&b':
                        setPageTitle('B&B Expertise');
                        fetchedGroups = await fetchGroupsForBandB(id);
                        break;
                    case 'saving-zone':
                        setPageTitle('Saving Zone');
                        fetchedGroups = await getGroupsBySavingZoneId(id);
                        break;
                    case 'quick-pick':
                    default:
                        setPageTitle('Quick Picks');
                        fetchedGroups = await fetchGroupsForQuickPick(id);
                        break;
                }

                setGroups(fetchedGroups || []);
                if (fetchedGroups && fetchedGroups.length > 0) {
                    setSelectedGroup(fetchedGroups[0]);
                }
            } catch (error) {
                console.error(`Error fetching groups for section "${section}":`, error);
            } finally {
                setLoadingGroups(false);
            }
        }
        loadGroups();
    }, [section, id]);

    // 2. Fetch products based on the 'section' and selected group
    useEffect(() => {
        if (!selectedGroup) {
            setProducts([]);
            return;
        }

        async function loadProducts() {
            try {
                setLoadingProducts(true);
                let fetchedProducts;

                switch (section) {
                    case 'b&b':
                        fetchedProducts = await fetchProductsForBandBGroup(selectedGroup.id);
                        break;
                    case 'saving-zone':
                        fetchedProducts = await getProductsForSavingZoneGroup(selectedGroup.id);
                        break;
                    case 'quick-pick':
                    default:
                        fetchedProducts = await fetchProductsForGroup(selectedGroup.id);
                        break;
                }
                setProducts(fetchedProducts || []);
            } catch (error) {
                console.error(`Error fetching products for section "${section}":`, error);
            } finally {
                setLoadingProducts(false);
            }
        }
        loadProducts();
    }, [selectedGroup, section]);

    if (loadingGroups) {
        return <div className="flex justify-center items-center h-screen">Loading Section...</div>;
    }
    
    if (!groups.length) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <h1 className="text-2xl font-bold mb-2">{pageTitle}</h1>
                <p className="text-gray-600">No categories found for this item.</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 mt-[-42px]">
            {/* Sidebar for Groups */}
            <aside className="w-1/4 bg-white overflow-y-auto shadow-md hide-scrollbar">
                <ul className="py-2">
                    {groups.map((group) => (
                        <li
                            key={group.id}
                            onClick={() => setSelectedGroup(group)}
                            className={`relative flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 ease-in-out ${selectedGroup?.id === group.id
                                    ? 'bg-blue-50'
                                    : 'hover:bg-gray-100'
                                }`}
                        >
                            <div className={`absolute left-0 top-0 h-full w-1.5 rounded-r-full transition-all duration-300 ease-in-out ${selectedGroup?.id === group.id ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                            <img
                                src={group.image_url}
                                alt={group.name}
                                className="w-16 h-16 rounded-md object-cover border-2 border-gray-200"
                            />
                            <span className={`mt-2 text-center text-sm transition-colors duration-300 ease-in-out ${selectedGroup?.id === group.id ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                                {group.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Content for Products */}
            <main className="w-3/4 p-4 overflow-y-auto hide-scrollbar">
                {selectedGroup && (
                    <h1 className="text-2xl font-bold mb-4">{selectedGroup.name}</h1>
                )}

                {loadingProducts ? (
                    <div className="text-center p-10">Loading products...</div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                        {products.map((product) => (
                           product && <ProductCard2 key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 text-gray-500">
                        No products found in this category.
                    </div>
                )}
            </main>
        </div>
    );
}

export default DetailPage;