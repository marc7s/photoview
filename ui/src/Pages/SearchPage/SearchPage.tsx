import Layout from '../../components/layout/Layout'
import { useTranslation } from 'react-i18next'
import { AdvancedSearchQuery } from '../../components/advancedSearch/AdvancedSearch'

const SearchPage = () => {
  const { t } = useTranslation()

  return (
    <>
      <Layout title={t('search_page.title', 'Search')}>
        <AdvancedSearchQuery />
      </Layout>
    </>
  )
}

export default SearchPage
